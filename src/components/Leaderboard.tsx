import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, Medal, Flame, Users, Crown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Leaderboard() {
  const { globalLeaderboard, guildLeaderboard, myRank, isLoading } = useLeaderboard();
  const { user } = useAuth();
  const [tab, setTab] = useState<'players' | 'guilds'>('players');

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-muted-foreground font-bold w-5 text-center">{rank}</span>;
  };

  const getRankBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'bg-primary/10 border-2 border-primary';
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-gray-400/30';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/30';
    return 'bg-muted/50';
  };

  if (isLoading) {
    return (
      <Card className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-secondary" />
          <h3 className="font-display font-bold">Leaderboard</h3>
        </div>
        {myRank && (
          <Badge variant="outline" className="text-xs">
            Your Rank: #{myRank}
          </Badge>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'players' | 'guilds')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="players" className="gap-2">
            <Users className="w-4 h-4" />
            Players
          </TabsTrigger>
          <TabsTrigger value="guilds" className="gap-2">
            <Crown className="w-4 h-4" />
            Guilds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="mt-4 space-y-2">
          {globalLeaderboard.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No players yet. Be the first!</p>
            </div>
          ) : (
            globalLeaderboard.slice(0, 10).map((entry) => {
              const isCurrentUser = entry.user_id === user?.id;
              return (
                <div
                  key={entry.user_id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all',
                    getRankBg(entry.rank, isCurrentUser)
                  )}
                >
                  <div className="w-8 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        'font-semibold text-sm truncate',
                        isCurrentUser && 'text-primary'
                      )}>
                        {entry.display_name || entry.username}
                        {isCurrentUser && ' (You)'}
                      </p>
                      {entry.guild_icon && (
                        <span className="text-xs">{entry.guild_icon}</span>
                      )}
                    </div>
                    {entry.guild_name && (
                      <p className="text-xs text-muted-foreground truncate">
                        {entry.guild_name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">{entry.streak}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{entry.xp.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="guilds" className="mt-4 space-y-2">
          {guildLeaderboard.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Crown className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No guilds yet. Create one!</p>
            </div>
          ) : (
            guildLeaderboard.slice(0, 10).map((guild) => (
              <div
                key={guild.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border transition-all',
                  getRankBg(guild.rank, false)
                )}
              >
                <div className="w-8 flex justify-center">
                  {getRankIcon(guild.rank)}
                </div>
                
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                  {guild.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{guild.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {guild.member_count} member{guild.member_count !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-primary">{guild.total_xp.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
