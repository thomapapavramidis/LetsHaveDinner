import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowBigUp, Flame, Image as ImageIcon, Send, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface Post {
  id: string;
  content: string;
  upvotes: number;
  created_at: string;
  user_has_upvoted: boolean;
  image_url: string | null;
}

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPostImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setNewPostImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreatePost = async () => {
    if (!user || (!newPostContent.trim() && !newPostImage)) {
      toast.error("add some content or an image!");
      return;
    }

    setUploading(true);
    try {
      let imageUrl = null;

      // Upload image if present
      if (newPostImage) {
        const fileExt = newPostImage.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(fileName, newPostImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("post-images")
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Create post
      const { error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: newPostContent.trim() || "",
          image_url: imageUrl
        });

      if (postError) throw postError;

      toast.success("post created! 🎉");
      setNewPostContent("");
      setNewPostImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error(error);
      toast.error("couldn't create post, try again");
    } finally {
      setUploading(false);
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
            <Flame className="w-5 h-5 animate-pulse" />
            HOT TAKES
          </div>
          <h1 className="text-4xl font-black text-foreground mb-2">dinner vibes 🔥</h1>
          <p className="text-muted-foreground font-medium">
            share moments from your dinners
          </p>
        </div>

        {user && (
          <Card className="p-4 mb-6 bg-card/95 backdrop-blur-sm border-2 border-primary/10 shadow-[var(--shadow-soft)] animate-fade-in">
            <Textarea
              placeholder="what's on your mind? share a moment from dinner..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="min-h-[80px] mb-3 border-2 resize-none font-medium"
            />
            
            {imagePreview && (
              <div className="relative mb-3 rounded-lg overflow-hidden border-2 border-border">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 font-semibold"
                disabled={uploading}
              >
                <ImageIcon className="w-4 h-4" />
                {imagePreview ? "change image" : "add image"}
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={uploading || (!newPostContent.trim() && !newPostImage)}
                className="ml-auto gap-2 font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                {uploading ? "posting..." : "post"}
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

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
                    {post.image_url && (
                      <div className="mb-3 rounded-lg overflow-hidden border-2 border-border/50">
                        <img 
                          src={post.image_url} 
                          alt="Post" 
                          className="w-full max-h-96 object-cover hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                    )}
                    {post.content && (
                      <p className="text-foreground leading-relaxed font-medium mb-2">
                        {post.content}
                      </p>
                    )}
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
