import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

interface Person {
  id: string;
  name: string;
}

const CreateCase = () => {
  const navigate = useNavigate();
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    requester_id: "",
    related_person: "",
    vision_1: "",
    vision_2: "",
    resolution_comment: "",
    is_resolved: false,
  });

  useEffect(() => {
    const fetchPeople = async () => {
      const { data, error } = await supabase
        .from("people")
        .select("*")
        .order("name");

      if (error) {
        toast({
          title: "Erro ao carregar pessoas",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setPeople(data || []);
      }
    };

    fetchPeople();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.requester_id || !formData.related_person) {
      toast({
        title: "Ops! 😅",
        description: "Preencha os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.from("cases").insert([
      {
        requester_id: formData.requester_id,
        related_person: formData.related_person,
        vision_1: formData.vision_1 || null,
        vision_2: formData.vision_2 || null,
        resolution_comment: formData.resolution_comment || null,
        is_resolved: formData.is_resolved,
      },
    ]);

    setIsLoading(false);

    if (error) {
      toast({
        title: "Erro ao salvar caso",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Prontinho! Caso salvo 💙",
        description: "O caso foi registrado com sucesso",
      });
      navigate("/casos");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-poppins font-bold">Criar Novo Caso</h1>
        <p className="text-lg text-muted-foreground font-nunito max-w-2xl mx-auto">
          Preencha as informações abaixo para registrar um novo caso
        </p>
      </div>

      <Card className="p-8 card-soft rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Requester */}
          <div className="space-y-2">
            <Label className="font-poppins">Quem está registrando?</Label>
            <Select
              value={formData.requester_id}
              onValueChange={(value) =>
                setFormData({ ...formData, requester_id: value })
              }
            >
              <SelectTrigger className="h-12 rounded-2xl">
                <SelectValue placeholder="Selecione uma pessoa" />
              </SelectTrigger>
              <SelectContent>
                {people.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Related Person */}
          <div className="space-y-2">
            <Label className="font-poppins">Pessoa relacionada</Label>
            <Select
              value={formData.related_person}
              onValueChange={(value) =>
                setFormData({ ...formData, related_person: value })
              }
            >
              <SelectTrigger className="h-12 rounded-2xl">
                <SelectValue placeholder="Selecione uma pessoa" />
              </SelectTrigger>
              <SelectContent>
                {people.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vision 1 */}
          <div className="space-y-2">
            <Label className="font-poppins">Visão 1</Label>
            <Input
              placeholder="Descreva a primeira visão..."
              value={formData.vision_1}
              onChange={(e) =>
                setFormData({ ...formData, vision_1: e.target.value })
              }
              className="h-12 rounded-2xl"
            />
          </div>

          {/* Vision 2 */}
          <div className="space-y-2">
            <Label className="font-poppins">Visão 2</Label>
            <Input
              placeholder="Descreva a segunda visão..."
              value={formData.vision_2}
              onChange={(e) =>
                setFormData({ ...formData, vision_2: e.target.value })
              }
              className="h-12 rounded-2xl"
            />
          </div>

          {/* Resolution Comment */}
          <div className="space-y-2">
            <Label className="font-poppins">Resolução / Comentário</Label>
            <Textarea
              placeholder="Adicione comentários ou resolução..."
              value={formData.resolution_comment}
              onChange={(e) =>
                setFormData({ ...formData, resolution_comment: e.target.value })
              }
              className="min-h-32 rounded-2xl"
            />
          </div>

          {/* Is Resolved */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="resolved"
              checked={formData.is_resolved}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_resolved: checked as boolean })
              }
            />
            <Label htmlFor="resolved" className="font-nunito cursor-pointer">
              Marcar como resolvido
            </Label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 h-12 rounded-2xl font-poppins font-semibold bg-gradient-primary hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar Caso"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="h-12 rounded-2xl font-poppins"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateCase;
