<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogPost::with('media', 'author')->where('status', 'published');

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('content', 'like', "%{$s}%");
            });
        }

        $perPage = min((int) ($request->perPage ?? 12), 50);

        return response()->json(
            $query->latest('published_at')->paginate($perPage)
        );
    }

    public function show(string $slug)
    {
        $post = BlogPost::with('media', 'author')
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        return response()->json($post);
    }

    public function categories()
    {
        return response()->json(
            BlogPost::where('status', 'published')
                ->selectRaw('category, count(*) as total')
                ->groupBy('category')
                ->orderBy('total', 'desc')
                ->get()
        );
    }

    public function featured()
    {
        return response()->json(
            BlogPost::with('media', 'author')
                ->where('featured', true)
                ->where('status', 'published')
                ->latest('published_at')
                ->take(3)
                ->get()
        );
    }

    public function incrementViews(string $slug)
    {
        $post = BlogPost::where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        $post->increment('views');

        return response()->json(['views' => $post->fresh()->views]);
    }

    public function related(string $slug)
    {
        $post = BlogPost::where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        $related = BlogPost::with('media')
            ->where('status', 'published')
            ->where('category', $post->category)
            ->where('id', '!=', $post->id)
            ->inRandomOrder()
            ->take(3)
            ->get();

        return response()->json($related);
    }

    public function popular()
    {
        return response()->json(
            BlogPost::with('media')
                ->where('status', 'published')
                ->orderBy('views', 'desc')
                ->take(5)
                ->get()
        );
    }
}
