<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'avatar' => ['nullable', 'string', 'max:1000'],
            'bio' => ['nullable', 'string', 'max:1500'],
            'location' => ['nullable', 'string', 'max:120'],
            'website_url' => ['nullable', 'url', 'max:255'],
            'preferred_categories' => ['nullable', 'array'],
            'preferred_categories.*' => ['string', 'max:100'],
            'notify_new_content' => ['nullable', 'boolean'],
            'notify_comment_replies' => ['nullable', 'boolean'],
            'notify_premium_status' => ['nullable', 'boolean'],
            'locale' => ['nullable', 'in:id,en'],
            'timezone' => ['nullable', 'string', 'max:64'],
        ];
    }
}
