import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowBigUp, Flame } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Post {
  id: string;
  content: string;
  upvotes: number;
  created_at: string;
  user_has_upvoted: boolean;
}

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .eq("is_featured", true)
      .order("upvotes", { ascending: false })
      .limit(20);

    if (postsData && user) {
      const { data: upvotesData } = await supabase
        .from("post_upvotes")
        .select("post_id")
        .eq("user_id", user.id);

      const upvotedPostIds = new Set(upvotesData?.map(u => u.post_id) || []);

      const enrichedPosts = postsData.map(post => ({
        ...post,
        user_has_upvoted: upvotedPostIds.has(post.id)
      }));

      setPosts(enrichedPosts);
    } else if (postsData) {
      setPosts(postsData.map(p => ({ ...p, user_has_upvoted: false })));
    }
    setLoading(false);
  };

  const handleUpvote = async (postId: string, currentlyUpvoted: boolean) => {
    if (!user) return;

    try {
      if (currentlyUpvoted) {
        await supabase
          .from("post_upvotes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("post_upvotes")
          .insert({ post_id: postId, user_id: user.id });
      }

      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            upvotes: currentlyUpvoted ? post.upvotes - 1 : post.upvotes + 1,
            user_has_upvoted: !currentlyUpvoted
          };
        }
        return post;
      }));
    } catch (error) {
      toast.error("couldn't upvote rn, try again");
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 pb-20">
      <div className="container max-w-2xl mx-auto px-4 pt-8">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 text-primary font-bold mb-3">
            <Flame className="w-5 h-5" />
            HOT TAKES
          </div>
          <h1 className="text-4xl font-black text-foreground mb-2">dinner vibes 🔥</h1>
          <p className="text-muted-foreground font-medium">
            the best moments from past dinners
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post, idx) => (
              <Card 
                key={post.id} 
                className="p-5 hover:shadow-[var(--shadow-soft)] transition-all duration-300 hover:scale-[1.01] bg-card/90 backdrop-blur-sm border-2 border-transparent hover:border-primary/20 animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpvote(post.id, post.user_has_upvoted)}
                      className={`h-8 w-8 p-0 rounded-full transition-all duration-200 ${
                        post.user_has_upvoted 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                          : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                      }`}
                    >
                      <ArrowBigUp className={`w-5 h-5 ${post.user_has_upvoted ? "fill-current" : ""}`} />
                    </Button>
                    <span className={`text-sm font-bold ${post.user_has_upvoted ? "text-primary" : "text-muted-foreground"}`}>
                      {post.upvotes}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground leading-relaxed font-medium mb-2">
                      {post.content}
                    </p>
                    <p className="text-xs text-muted-foreground font-semibold">
                      {getTimeAgo(post.created_at)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground font-medium">no posts yet... be the first to share! ✨</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Feed;
