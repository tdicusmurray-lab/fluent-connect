import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useGuilds, Guild } from '@/hooks/useGuilds';
import { useAuth } from '@/hooks/useAuth';
import { Crown, Users, LogOut, Plus, Loader2, Shield, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const GUILD_ICONS = ['🏰', '⚔️', '🛡️', '🦅', '🐉', '🌟', '🔥', '💎', '🎯', '🏆', '👑', '🦁'];

export function GuildPanel() {
  const { guilds, myGuild, guildMembers, isLoading, createGuild, joinGuild, leaveGuild } = useGuilds();
  const { user, isSignedIn } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildDesc, setNewGuildDesc] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏰');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState<string | null>(null);

  const handleCreateGuild = async () => {
    if (!newGuildName.trim()) {
      toast.error('Please enter a guild name');
      return;
    }
    setIsCreating(true);
    const success = await createGuild(newGuildName.trim(), newGuildDesc.trim(), selectedIcon);
    if (success) {
      setShowCreate(false);
      setNewGuildName('');
      setNewGuildDesc('');
    }
    setIsCreating(false);
  };

  const handleJoinGuild = async (guildId: string) => {
    setIsJoining(guildId);
    await joinGuild(guildId);
    setIsJoining(null);
  };

  const handleLeaveGuild = async () => {
    if (confirm('Are you sure you want to leave this guild?')) {
      await leaveGuild();
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Card>
    );
  }

  // Show current guild info
  if (myGuild) {
    return (
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
              {myGuild.icon}
            </div>
            <div>
              <h3 className="font-display font-bold">{myGuild.name}</h3>
              <p className="text-xs text-muted-foreground">
                {myGuild.member_count} members • {myGuild.total_xp.toLocaleString()} XP
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLeaveGuild}>
            <LogOut className="w-4 h-4 mr-1" />
            Leave
          </Button>
        </div>

        {myGuild.description && (
          <p className="text-sm text-muted-foreground">{myGuild.description}</p>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" />
            Members
          </h4>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {guildMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  {member.role === 'leader' && <Crown className="w-4 h-4 text-yellow-500" />}
                  {member.role === 'officer' && <Shield className="w-4 h-4 text-blue-500" />}
                  <span className={cn(
                    'text-sm',
                    member.user_id === user?.id && 'font-semibold text-primary'
                  )}>
                    {member.profiles?.display_name || member.profiles?.username || 'Member'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{(member.profiles?.xp || 0).toLocaleString()} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Show guild browser
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-secondary" />
          <h3 className="font-display font-bold">Guilds</h3>
        </div>
        {isSignedIn && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a Guild</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {GUILD_ICONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setSelectedIcon(icon)}
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all',
                          selectedIcon === icon
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        )}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Guild Name</label>
                  <Input
                    value={newGuildName}
                    onChange={(e) => setNewGuildName(e.target.value)}
                    placeholder="Enter guild name..."
                    maxLength={30}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Input
                    value={newGuildDesc}
                    onChange={(e) => setNewGuildDesc(e.target.value)}
                    placeholder="Optional description..."
                    maxLength={100}
                  />
                </div>
                <Button 
                  onClick={handleCreateGuild} 
                  className="w-full"
                  disabled={isCreating || !newGuildName.trim()}
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Create Guild
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!isSignedIn && (
        <div className="text-center py-4 text-muted-foreground">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Sign in to join a guild!</p>
        </div>
      )}

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {guilds.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Crown className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No guilds yet. Be the first to create one!</p>
          </div>
        ) : (
          guilds.map((guild) => (
            <div
              key={guild.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border"
            >
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-xl">
                {guild.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{guild.name}</p>
                <p className="text-xs text-muted-foreground">
                  {guild.member_count} members • {guild.total_xp.toLocaleString()} XP
                </p>
              </div>
              {isSignedIn && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleJoinGuild(guild.id)}
                  disabled={isJoining === guild.id}
                >
                  {isJoining === guild.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Join'
                  )}
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
