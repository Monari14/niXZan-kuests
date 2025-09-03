<?php

namespace App\Http\Controllers;

use App\Models\Kuest;
use App\Http\Resources\KuestsResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Notifications\KuestLiked;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;

class KuestsController extends Controller
{
    public function index()
    {
        $kuest = Kuest::with(['user'])
            ->latest()
            ->paginate(10);

        return KuestsResource::collection($kuest);
    }

    public function show($id_kuest)
    {
        $kuest = Kuest::with(['user'])->findOrFail($id_kuest);
        return new KuestsResource($kuest);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        if(!$user){
            return response()->json([
                'error' => 'Usuário não autenticado.'
            ], 401);
        }

        try {
            $validated = $request->validate([
                'title'   => 'required|string|max:255',
                'description' => 'required|string',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'error'   => 'Erro de validação.',
                'details' => $e->errors()
            ], 422);
        }

        try {
            $validated['id_user'] = $user->id;
            $kuests = Kuest::create($validated);

            return new KuestsResource($kuests);
        } catch (QueryException $e) {
            return response()->json([
                'error'   => 'Erro ao salvar no banco de dados.',
                'details' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Erro inesperado.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id_kuest)
    {
        $kuests = Kuest::findOrFail($id_kuest);

        if ($kuests->id_user !== Auth::id()) {
            return response()->json(['error' => 'Não autorizado'], 403);
        }

        $validated = $request->validate([
            'title'   => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
        ]);

        $kuests->update($validated);
        $kuests->load('user');

        return new KuestsResource($kuests);
    }

    public function destroy($id_kuest)
    {
        $kuests = Kuest::findOrFail($id_kuest);

        if ($kuests->id_user !== Auth::id()) {
            return response()->json(['error' => 'Não autorizado'], 403);
        }

        $kuests->delete();

        return response()->json(['message' => 'Kuest removido com sucesso']);
    }
    public function like(Request $request, $id_kuest)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário não autenticado.'
            ], 401);
        }

        $kuests = Kuest::find($id_kuest);
        if (!$kuests) {
            return response()->json([
                'success' => false,
                'message' => 'Kuest não encontrado.'
            ], 404);
        }

        if ($kuests->id_user === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Você não pode curtir sua própria Kuest.'
            ], 403);
        }

        if ($kuests->likes()->where('id_user', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Você já curtiu este Kuest.'
            ], 400);
        }

        try {
            $kuests->likes()->create([
                'id_user' => $user->id,
            ]);

            try {
                $kuests->user->notify(new KuestLiked($user, $kuests->id));
            } catch (\Exception $e) {
                \Log::warning('Falha ao enviar notificação de like: '.$e->getMessage());
            }

            $kuests->loadCount('likes');

            return response()->json([
                'success' => true,
                'message' => 'Kuest curtido com sucesso!',
                'likes'   => $kuests->likes_count
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao curtir o Kuest.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }
    public function unlike(Request $request, $id_kuest)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário não autenticado.'
            ], 401);
        }

        $kuests = Kuest::find($id_kuest);
        if (!$kuests) {
            return response()->json([
                'success' => false,
                'message' => 'Kuest não encontrado.'
            ], 404);
        }

        $like = $kuests->likes()->where('id_user', $user->id)->first();
        if (!$like) {
            return response()->json([
                'success' => false,
                'message' => 'Você não curtiu esta Kuest.'
            ], 400);
        }

        try {
            $like->delete();

            $kuests->loadCount('likes');

            return response()->json([
                'success' => true,
                'message' => 'Curtida removida com sucesso.',
                'likes'   => $kuests->likes_count
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao remover curtida.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }
}
