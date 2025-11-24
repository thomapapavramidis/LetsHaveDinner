import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { Heart, ImagePlus, Send, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  upvotes: number;
  is_anonymous: boolean;
  cycle_id: string | null;
  is_featured: boolean;
  created_at: string;
}

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [upvotedPosts, setUpvotedPosts] = useState<Set<string>>(new Set());
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("couldn't load posts");
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('post-images')
      .upload(fileName, file);

    if (uploadError) {
      console.error(uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleCreatePost = async () => {
    if (!user || (!newPost.trim() && !selectedImage)) {
      toast.error("write something or add an image!");
      return;
    }

    setPosting(true);
    try {
      let imageUrl = null;
      
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          toast.error("failed to upload image");
          setPosting(false);
          return;
        }
      }

      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: newPost.trim(),
          image_url: imageUrl,
          upvotes: 0,
          is_anonymous: isAnonymous
        });

      if (error) throw error;

      setNewPost("");
      setSelectedImage(null);
      setImagePreview(null);
      setIsAnonymous(false);
      toast.success("posted! 🎉");
      fetchPosts();
    } catch (error) {
      console.error(error);
      toast.error("couldn't post, try again");
    } finally {
      setPosting(false);
    }
  };

  const handleUpvote = async (postId: string, currentUpvotes: number) => {
    if (upvotedPosts.has(postId)) {
      toast.error("you already upvoted this!");
      return;
    }

    const { error } = await supabase
      .from("posts")
      .update({ upvotes: currentUpvotes + 1 })
      .eq("id", postId);

    if (error) {
      console.error(error);
      toast.error("couldn't upvote");
    } else {
      setUpvotedPosts(prev => new Set(prev).add(postId));
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p
      ));
    }
  };

  const timeAgo = (dateString: string) => {
    const now = new Date();
    const posted = new Date(dateString);
    const seconds = Math.floor((now.getTime() - posted.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container max-w-2xl mx-auto p-6 pt-8 relative">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-black text-foreground mb-2 flex items-center gap-3">
            <span className="gradient-text">community</span> feed
            <Sparkles className="w-8 h-8 text-primary animate-glow" />
          </h1>
          <p className="text-muted-foreground font-medium">
            share your thoughts and vibe with the community
          </p>
        </div>

        {/* Create Post Card */}
        <Card className="mb-8 glass-card border-2 border-border shadow-[var(--shadow-float)] hover-lift animate-fade-in-up">
          <CardContent className="p-6 space-y-4">
            <Textarea
              placeholder="what's on your mind? ✨"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[100px] border-2 border-border focus:border-primary rounded-xl resize-none text-base font-medium bg-background/50"
            />

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Post anonymously
              </span>
            </label>
            
            {imagePreview && (
              <div className="relative rounded-xl overflow-hidden border-2 border-border animate-scale-in">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-background/90 rounded-lg hover:bg-background transition-all"
                >
                  remove
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <label className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  asChild
                >
                  <span className="cursor-pointer">
                    <ImagePlus className="w-4 h-4" />
                    add image
                  </span>
                </Button>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>

              <Button
                onClick={handleCreatePost}
                disabled={posting || (!newPost.trim() && !selectedImage)}
                variant="gradient"
                className="flex-1 gap-2"
              >
                {posting ? "posting..." : "post"}
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        <div className="space-y-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="glass-card border-2 border-border animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : posts.length === 0 ? (
            <Card className="glass-card border-2 border-border animate-fade-in-up">
              <CardContent className="p-12 text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-xl font-semibold text-muted-foreground">
                  no posts yet. be the first to share! ✨
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post, index) => (
              <Card 
                key={post.id} 
                className="glass-card border-2 border-border shadow-[var(--shadow-card)] hover-lift animate-fade-in-up transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-black text-lg shadow-[var(--shadow-soft)]">
                      {post.is_anonymous ? "?" : "U"}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground">
                        {post.is_anonymous ? "anonymous" : "user"}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">
                        {timeAgo(post.created_at)}
                      </p>
                    </div>
                  </div>

                  {post.content && (
                    <p className="text-foreground mb-4 text-base leading-relaxed font-medium">
                      {post.content}
                    </p>
                  )}

                  {post.image_url && (
                    <div className="mb-4 rounded-xl overflow-hidden border-2 border-border">
                      <img 
                        src={post.image_url} 
                        alt="Post" 
                        className="w-full max-h-96 object-cover"
                      />
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUpvote(post.id, post.upvotes)}
                    disabled={upvotedPosts.has(post.id)}
                    className={`gap-2 transition-all ${upvotedPosts.has(post.id) ? 'text-primary' : ''}`}
                  >
                    <Heart 
                      className={`w-4 h-4 transition-all ${upvotedPosts.has(post.id) ? 'fill-primary' : ''}`} 
                    />
                    <span className="font-bold">{post.upvotes}</span>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Feed;
