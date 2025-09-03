<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserSettings;

class SettingsController extends Controller
{
    public function getTheme()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Usuário não autenticado.'], 401);
        }

        $userSetting = UserSettings::where('id_user', $user->id)->first();

        if (!$userSetting) {
            return response()->json(['theme' => null], 200);
        }

        return response()->json([
            'theme' => $userSetting->theme
        ], 200);
    }
    public function theme(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Usuário não autenticado.'], 401);
        }

        $request->validate([
            'theme' => 'required|string',
        ]);

        $userSetting = UserSettings::updateOrCreate(
            ['id_user' => $user->id],
            ['theme' => $request->theme]
        );

        return response()->json([
            'message' => 'Tema atualizado com sucesso.',
            'theme' => $userSetting->theme
        ], 200);
    }
}
