import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Edit, Trash2, CheckCircle2 } from "lucide-react";

interface Person {
  id: string;
  name: string;
}

interface Case {
  id: string;
  requester_id: string;
  related_person: string;
  vision_1: string | null;
  vision_2: string | null;
  resolution_comment: string | null;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  requester?: Person;
  relatedPerson?: Person;
}

const Cases = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cases, setCases] = useState<Case[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingCase, setIsDeletingCase] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Case>>({});
  const [activeTab, setActiveTab] = useState("pending");
  const caseIdRef = useRef<string | null>(null);

  const fetchCases = async () => {
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar casos",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Fetch person names
      const peopleIds = new Set<string>();
      data?.forEach((c) => {
        peopleIds.add(c.requester_id);
        peopleIds.add(c.related_person);
      });

      const { data: peopleData } = await supabase
        .from("people")
        .select("*")
        .in("id", Array.from(peopleIds));

      const peopleMap = new Map(peopleData?.map((p) => [p.id, p]) || []);

      const casesWithNames = data?.map((c) => ({
        ...c,
        relatedPersonId: c.related_person,
        requester: peopleMap.get(c.requester_id),
        relatedPerson: peopleMap.get(c.related_person),
      }));

      setCases(casesWithNames || []);
    }
  };

  const fetchPeople = async () => {
    const { data } = await supabase.from("people").select("*").order("name");
    setPeople(data || []);
  };

  useEffect(() => {
    fetchCases();
    fetchPeople();
  }, []);

  // Handle case navigation from URL
  useEffect(() => {
    const caseId = searchParams.get("id");

    if (caseId && cases.length > 0) {
      const caseToOpen = cases.find((c) => c.id === caseId);
      if (caseToOpen && caseIdRef.current !== caseId) {
        // Automatically switch to the appropriate tab
        setActiveTab(caseToOpen.is_resolved ? "resolved" : "pending");

        // Open the case modal
        openCaseModal(caseToOpen);
        caseIdRef.current = caseId;
      } else if (!caseToOpen && caseIdRef.current !== caseId) {
        // Case not found, clear URL
        setSearchParams({});
        caseIdRef.current = null;
      }
    } else if (!caseId && caseIdRef.current !== null) {
      // Reset when no case ID in URL
      setSelectedCase(null);
      caseIdRef.current = null;
    }
  }, [searchParams, cases]);

  const handleMarkResolved = async (caseItem: Case) => {
    const { error } = await supabase
      .from("cases")
      .update({ is_resolved: true })
      .eq("id", caseItem.id);

    if (error) {
      toast({
        title: "Erro ao atualizar caso",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Caso resolvido! ✅",
        description: "O caso foi marcado como resolvido",
      });
      fetchCases();
      setSelectedCase(null);
      
      // Update URL to remove case ID
      setSearchParams({});
    }
  };

  const handleEdit = async () => {
    if (!selectedCase) return;

    const { error } = await supabase
      .from("cases")
      .update(editForm as any)
      .eq("id", selectedCase.id);

    if (error) {
      toast({
        title: "Erro ao atualizar caso",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Caso atualizado! 💙",
        description: "As alterações foram salvas",
      });
      fetchCases();
      setIsEditing(false);
      setSelectedCase(null);
      
      // Update URL to remove case ID
      setSearchParams({});
    }
  };

  const handleDelete = async () => {
    if (!selectedCase || isDeletingCase) return;

    setIsDeletingCase(true);

    try {
      const { error } = await supabase
        .from("cases")
        .delete()
        .eq("id", selectedCase.id);

      if (error) {
        console.error("Erro ao deletar caso:", error);
        toast({
          title: "Erro ao excluir caso",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log("Caso deletado com sucesso:", selectedCase.id);
        toast({
          title: "Caso excluído 🗑️",
          description: "O caso foi removido com sucesso",
        });

        // Close modal and refresh data
        setIsDeleting(false);
        setSelectedCase(null);
        setSearchParams({});

        // Fetch updated cases list
        fetchCases();
      }
    } catch (error) {
      console.error("Erro inesperado ao deletar:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao excluir o caso",
        variant: "destructive",
      });
    } finally {
      setIsDeletingCase(false);
    }
  };

  const openCaseModal = (caseItem: Case) => {
    // Reset all modal states first
    setIsEditing(false);
    setIsDeleting(false);
    // Then set the selected case
    setSelectedCase(caseItem);
    setEditForm({
      vision_1: caseItem.vision_1,
      vision_2: caseItem.vision_2,
      resolution_comment: caseItem.resolution_comment,
      is_resolved: caseItem.is_resolved,
    });
  };

  const pendingCases = cases.filter((c) => !c.is_resolved);
  const resolvedCases = cases.filter((c) => c.is_resolved);

  const CaseCard = ({ caseItem }: { caseItem: Case }) => (
    <Card
      className="p-6 card-soft hover-lift rounded-3xl cursor-pointer"
      onClick={() => openCaseModal(caseItem)}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-poppins font-semibold text-lg mb-1">
              {caseItem.requester?.name || "Desconhecido"}
            </p>
            <p className="text-sm text-muted-foreground">
              Sobre: {caseItem.relatedPerson?.name || "Desconhecido"}
            </p>
          </div>
          <Badge
            variant={caseItem.is_resolved ? "default" : "secondary"}
            className="rounded-full"
          >
            {caseItem.is_resolved ? "Resolvido" : "Pendente"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {format(new Date(caseItem.created_at), "dd 'de' MMMM 'de' yyyy", {
            locale: ptBR,
          })}
        </p>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-poppins font-bold">Casos</h1>
        <p className="text-lg text-muted-foreground font-nunito max-w-2xl mx-auto">
          Visualize e gerencie todos os casos registrados
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-12 rounded-2xl">
          <TabsTrigger value="pending" className="rounded-xl font-poppins">
            Pendentes ({pendingCases.length})
          </TabsTrigger>
          <TabsTrigger value="resolved" className="rounded-xl font-poppins">
            Resolvidos ({resolvedCases.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingCases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
            {pendingCases.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground font-nunito">
                  Nenhum caso pendente no momento 🎉
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="resolved" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resolvedCases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
            {resolvedCases.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground font-nunito">
                  Nenhum caso resolvido ainda
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Case Detail Modal */}
      {selectedCase && (
        <Dialog open={!isEditing} onOpenChange={() => {
          setSelectedCase(null);
          setSearchParams({});
        }}>
          <DialogContent className="max-w-2xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-poppins text-2xl">
                Detalhes do Caso
              </DialogTitle>
              <DialogDescription>
                {format(
                  new Date(selectedCase.created_at),
                  "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                  { locale: ptBR }
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label className="font-poppins text-sm text-muted-foreground">
                  Solicitante
                </Label>
                <p className="font-nunito text-lg">
                  {selectedCase.requester?.name || "Desconhecido"}
                </p>
              </div>

              <div>
                <Label className="font-poppins text-sm text-muted-foreground">
                  Pessoa Relacionada
                </Label>
                <p className="font-nunito text-lg">
                  {selectedCase.relatedPerson?.name || "Desconhecido"}
                </p>
              </div>

              {selectedCase.vision_1 && (
                <div>
                  <Label className="font-poppins text-sm text-muted-foreground">
                    Visão 1
                  </Label>
                  <p className="font-nunito">{selectedCase.vision_1}</p>
                </div>
              )}

              {selectedCase.vision_2 && (
                <div>
                  <Label className="font-poppins text-sm text-muted-foreground">
                    Visão 2
                  </Label>
                  <p className="font-nunito">{selectedCase.vision_2}</p>
                </div>
              )}

              {selectedCase.resolution_comment && (
                <div>
                  <Label className="font-poppins text-sm text-muted-foreground">
                    Resolução / Comentário
                  </Label>
                  <p className="font-nunito">{selectedCase.resolution_comment}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Badge
                  variant={selectedCase.is_resolved ? "default" : "secondary"}
                  className="rounded-full"
                >
                  {selectedCase.is_resolved ? "Resolvido" : "Pendente"}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              {!selectedCase.is_resolved && (
                <Button
                  onClick={() => handleMarkResolved(selectedCase)}
                  className="flex-1 h-11 rounded-2xl bg-green-500 hover:bg-green-600 font-poppins"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Marcar como Resolvido
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="h-11 rounded-2xl font-poppins"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeletingCase}
                className="h-11 rounded-2xl font-poppins"
              >
                {isDeletingCase ? "Excluindo..." : <Trash2 className="w-4 h-4" />}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditing} onOpenChange={() => setIsEditing(false)}>
        <DialogContent className="max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-poppins text-2xl">Editar Caso</DialogTitle>
            <DialogDescription>
              Faça alterações nos detalhes do caso selecionado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-poppins">Visão 1</Label>
              <Input
                value={editForm.vision_1 || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, vision_1: e.target.value })
                }
                className="h-12 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-poppins">Visão 2</Label>
              <Input
                value={editForm.vision_2 || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, vision_2: e.target.value })
                }
                className="h-12 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-poppins">Resolução / Comentário</Label>
              <Textarea
                value={editForm.resolution_comment || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, resolution_comment: e.target.value })
                }
                className="min-h-32 rounded-2xl"
              />
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="edit-resolved"
                checked={editForm.is_resolved || false}
                onCheckedChange={(checked) =>
                  setEditForm({ ...editForm, is_resolved: checked as boolean })
                }
              />
              <Label htmlFor="edit-resolved" className="font-nunito cursor-pointer">
                Marcar como resolvido
              </Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleEdit}
              className="flex-1 h-11 rounded-2xl bg-gradient-primary hover:opacity-90 font-poppins"
            >
              Salvar Alterações
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="h-11 rounded-2xl font-poppins"
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-poppins">
              Tem certeza?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-nunito">
              Isso não pode ser desfeito! 🗑️ O caso será excluído permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeletingCase}
              className="rounded-2xl bg-destructive hover:bg-destructive/90"
            >
              {isDeletingCase ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Cases;
