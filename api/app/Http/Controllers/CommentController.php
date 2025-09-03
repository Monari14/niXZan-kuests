<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Kuest;
use Auth;
use Illuminate\Http\Request;
use App\Notifications\KuestCommented;
use App\Http\Resources\CommentResource;

class CommentController extends Controller
{
    public function store(Request $request, $id_kuest)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Usuário não autenticado.',
            ], 401);
        }

        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $kuests = Kuest::find($id_kuest);

        if (!$kuests) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kuest não encontrado.',
            ], 404);
        }

        $comment = Comment::create([
            'id_kuest'  => $id_kuest,
            'id_user' => $user->id,
            'content' => $request->input('content'),
        ]);

        try {
            $kuests->user->notify(new KuestCommented($request->user(), $kuests->id));
        } catch (\Exception $e) {
            \Log::warning('Falha ao enviar notificação de comentário: '.$e->getMessage());
        }

        $comment->load('user:id,username,avatar');

        return response()->json([
            'status'  => 'success',
            'message' => 'Comentário adicionado com sucesso!',
            'data'    => new CommentResource($comment)
        ], 201);
    }

    public function index($id_kuest)
    {
        $kuests = Kuest::find($id_kuest);

        if (!$kuests) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kuest não encontrado.',
            ], 404);
        }

        $comments = $kuests->comments()
            ->with('user:id,username,avatar')
            ->latest()
            ->get();

        return response()->json([
            'status'  => 'success',
            'message' => 'Comentários carregados com sucesso.',
            'data'    => CommentResource::collection($comments)
        ], 200);
    }

    public function destroy(Request $request, $id_comment)
    {
        $comment = Comment::find($id_comment);

        if (!$comment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Comentário não encontrado.',
            ], 404);
        }

        if ($comment->id_user !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Não autorizado.',
            ], 403);
        }

        $comment->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Comentário deletado com sucesso.',
        ], 200);
    }
}
