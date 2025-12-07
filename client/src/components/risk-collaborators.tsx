import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, X } from "lucide-react";
import type { User } from "@shared/schema";

interface RiskCollaboratorsProps {
  riskId: number;
}

export function RiskCollaborators({ riskId }: RiskCollaboratorsProps) {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const { data: collaborators = [], isLoading: loadingCollaborators } = useQuery({
    queryKey: [`/api/risks/${riskId}/collaborators`],
  });

  const { data: allUsers = [], isLoading: loadingUsers } = useQuery<Omit<User, "passwordHash">[]>({
    queryKey: ["/api/users"],
  });

  const updateMutation = useMutation({
    mutationFn: (userIds: string[]) =>
      apiRequest("POST", `/api/risks/${riskId}/collaborators`, { userIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/risks/${riskId}/collaborators`] });
      toast({
        title: "Collaborators updated",
        description: "Risk collaborators have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update collaborators.",
        variant: "destructive",
      });
    },
  });

  const handleAddCollaborator = () => {
    if (!selectedUserId) return;

    const currentUserIds = collaborators.map((c: any) => c.userId);
    if (!currentUserIds.includes(selectedUserId)) {
      updateMutation.mutate([...currentUserIds, selectedUserId]);
      setSelectedUserId("");
    }
  };

  const handleRemoveCollaborator = (userId: string) => {
    const currentUserIds = collaborators.map((c: any) => c.userId);
    updateMutation.mutate(currentUserIds.filter((id: string) => id !== userId));
  };

  if (loadingCollaborators || loadingUsers) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const availableUsers = allUsers.filter(
    (user) => !collaborators.some((c: any) => c.userId === user.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collaborators</CardTitle>
        <CardDescription>Manage users collaborating on this risk</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a user to add" />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.department})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddCollaborator}
            disabled={!selectedUserId || updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="space-y-2">
          {collaborators.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No collaborators added yet
            </p>
          ) : (
            collaborators.map((collaborator: any) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{collaborator.userName}</p>
                  <p className="text-sm text-muted-foreground">
                    {collaborator.userEmail} • {collaborator.userDepartment}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCollaborator(collaborator.userId)}
                  disabled={updateMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
