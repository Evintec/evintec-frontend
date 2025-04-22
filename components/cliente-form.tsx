"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, ChevronRight, Save, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

const formSchema = z.object({
  codigo: z.string().min(1, { message: "Código é obrigatório" }),
  data_cadastro: z.date().optional(),
  data_alteracao: z.date().optional(),
  cnpj_cpf: z.string().optional(),
  rg_insc_estadual: z.string().optional(),
  nome_fantasia: z.string().optional(),
  razao_social: z.string().min(1, { message: "Razão Social é obrigatória" }),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  cep: z.string().optional(),
  codigo_ibge: z.string().optional(),
  pais: z.string().optional(),
  contato: z.string().optional(),
  telefone_principal: z.string().optional(),
  celular: z.string().optional(),
  telefone_contato: z.string().optional(),
  email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
  homepage: z.string().optional(),
  situacao: z.string().optional(),
  observacao: z.string().optional(),
  limite: z.string().optional(),
  tipopessoa: z.string().optional(),
  creditobloqueado: z.boolean().optional(),
  tipo_contribuinte: z.string().optional(),
  codigosuframa: z.string().optional(),
})

// Esquemas de validação para cada etapa
const stepValidationSchema = [
  // Etapa 1: Dados Gerais
  z.object({
    codigo: z.string().min(1, { message: "Código é obrigatório" }),
    data_cadastro: z.date().optional(),
    data_alteracao: z.date().optional(),
    cnpj_cpf: z.string().optional(),
    rg_insc_estadual: z.string().optional(),
    nome_fantasia: z.string().optional(),
    razao_social: z.string().min(1, { message: "Razão Social é obrigatória" }),
    tipopessoa: z.string().optional(),
    situacao: z.string().optional(),
    tipo_contribuinte: z.string().optional(),
    codigosuframa: z.string().optional(),
  }),
  // Etapa 2: Endereço
  z.object({
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    uf: z.string().optional(),
    cep: z.string().optional(),
    codigo_ibge: z.string().optional(),
    pais: z.string().optional(),
  }),
  // Etapa 3: Contato
  z.object({
    contato: z.string().optional(),
    telefone_principal: z.string().optional(),
    celular: z.string().optional(),
    telefone_contato: z.string().optional(),
    email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
    homepage: z.string().optional(),
  }),
  // Etapa 4: Financeiro
  z.object({
    limite: z.string().optional(),
    creditobloqueado: z.boolean().optional(),
    observacao: z.string().optional(),
  }),
]

const steps = [
  { title: "Dados Gerais", description: "Informações básicas do cliente" },
  { title: "Endereço", description: "Localização e endereço" },
  { title: "Contato", description: "Informações de contato" },
  { title: "Financeiro", description: "Dados financeiros" },
  { title: "Revisão", description: "Confirme os dados" },
]

export default function ClienteForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stepCompleted, setStepCompleted] = useState<boolean[]>([false, false, false, false, false])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: "",
      data_cadastro: new Date(),
      data_alteracao: new Date(),
      cnpj_cpf: "",
      rg_insc_estadual: "",
      nome_fantasia: "",
      razao_social: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      cep: "",
      codigo_ibge: "",
      pais: "Brasil",
      contato: "",
      telefone_principal: "",
      celular: "",
      telefone_contato: "",
      email: "",
      homepage: "",
      situacao: "Ativo",
      observacao: "",
      limite: "",
      tipopessoa: "F",
      creditobloqueado: false,
      tipo_contribuinte: "",
      codigosuframa: "",
    },
    mode: "onChange",
  })

  

  const estados = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ]
  console.log(form.watch());
  // Função para validar o passo atual
  const validateStep = async (stepIndex: number) => {
    if (stepIndex >= stepValidationSchema.length) return true

    try {
      const stepData = form.getValues()
      await stepValidationSchema[stepIndex].parseAsync(stepData)

      // Marcar etapa como concluída
      const newStepCompleted = [...stepCompleted]
      newStepCompleted[stepIndex] = true
      setStepCompleted(newStepCompleted)

      return true
    } catch (error) {
      // Forçar validação dos campos para mostrar erros
      await form.trigger()
      return false
    }
  }

  // Avançar para o próximo passo
  const nextStep = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  // Voltar para o passo anterior
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  // Ir para um passo específico (apenas se já foi concluído)
  const goToStep = (step: number) => {
    // Permitir voltar para qualquer etapa anterior
    if (step < currentStep) {
      setCurrentStep(step)
      return
    }

    // Permitir avançar apenas para etapas já concluídas
    if (stepCompleted[step - 1]) {
      setCurrentStep(step)
    }
  }

  // Enviar o formulário
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      console.log(values)
      // Simulação de envio para o servidor
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Marcar última etapa como concluída
      const newStepCompleted = [...stepCompleted]
      newStepCompleted[4] = true
      setStepCompleted(newStepCompleted)

      alert("Cliente salvo com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro ao salvar o cliente. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calcular progresso
  const progress = (currentStep / (steps.length - 1)) * 100

  // Renderizar o conteúdo do passo atual
  const renderStepContent = () => {
    const [date, setDate] = useState<Date>()
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-5 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código*</FormLabel>
                    <FormControl>
                      <Input placeholder="Código" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_cadastro"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-2.5">Data de Cadastro</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-100 justify-start text-left font-normal ",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipopessoa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Pessoa</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="F">Física</SelectItem>
                        <SelectItem value="J">Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cnpj_cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/CNPJ</FormLabel>
                    <FormControl>
                      <Input placeholder="CPF ou CNPJ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rg_insc_estadual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RG/Inscrição Estadual</FormLabel>
                    <FormControl>
                      <Input placeholder="RG ou Inscrição Estadual" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="razao_social"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razão Social*</FormLabel>
                    <FormControl>
                      <Input placeholder="Razão Social" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nome_fantasia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Fantasia</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome Fantasia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="situacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Situação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a situação" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                        <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo_contribuinte"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Contribuinte</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Contribuinte">Contribuinte</SelectItem>
                        <SelectItem value="Não Contribuinte">Não Contribuinte</SelectItem>
                        <SelectItem value="Isento">Isento</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="codigosuframa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código SUFRAMA</FormLabel>
                  <FormControl>
                    <Input placeholder="Código SUFRAMA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-5 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="logradouro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logradouro</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, Avenida, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o número" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="complemento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input placeholder="Complemento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input placeholder="Bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input placeholder="CEP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="uf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {estados.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codigo_ibge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código IBGE</FormLabel>
                    <FormControl>
                      <Input placeholder="Código IBGE" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="pais"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <FormControl>
                    <Input placeholder="País" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-5 duration-300">
            <FormField
              control={form.control}
              name="contato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Contato</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do contato" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefone_principal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone Principal</FormLabel>
                    <FormControl>
                      <Input placeholder="Telefone principal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="celular"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Celular</FormLabel>
                    <FormControl>
                      <Input placeholder="Celular" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="telefone_contato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone do Contato</FormLabel>
                  <FormControl>
                    <Input placeholder="Telefone do contato" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="homepage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="Website" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-5 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="limite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite de Crédito</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="creditobloqueado"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Crédito Bloqueado</FormLabel>
                      <FormDescription>Bloquear crédito para este cliente</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observações sobre o cliente" className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )
      case 4:
        // Etapa de revisão
        const values = form.getValues()
        return (
          <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-5 duration-300">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium text-lg mb-2">Dados Gerais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Código:</span>
                  <p className="font-medium">{values.codigo}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Data de Cadastro:</span>
                  <p className="font-medium">
                    {values.data_cadastro ? format(values.data_cadastro, "dd/MM/yyyy", { locale: ptBR }) : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Razão Social:</span>
                  <p className="font-medium">{values.razao_social}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Nome Fantasia:</span>
                  <p className="font-medium">{values.nome_fantasia || "-"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">CPF/CNPJ:</span>
                  <p className="font-medium">{values.cnpj_cpf || "-"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Tipo de Pessoa:</span>
                  <p className="font-medium">{values.tipopessoa === "F" ? "Física" : "Jurídica"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-medium text-lg mb-2">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                <div className="md:col-span-2">
                  <span className="text-sm text-muted-foreground">Logradouro:</span>
                  <p className="font-medium">
                    {values.logradouro || "-"}, {values.numero || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Bairro:</span>
                  <p className="font-medium">{values.bairro || "-"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">CEP:</span>
                  <p className="font-medium">{values.cep || "-"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Cidade/UF:</span>
                  <p className="font-medium">
                    {values.cidade || "-"}/{values.uf || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">País:</span>
                  <p className="font-medium">{values.pais || "-"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-medium text-lg mb-2">Contato</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Nome do Contato:</span>
                  <p className="font-medium">{values.contato || "-"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Telefone Principal:</span>
                  <p className="font-medium">{values.telefone_principal || "-"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Celular:</span>
                  <p className="font-medium">{values.celular || "-"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <p className="font-medium">{values.email || "-"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Website:</span>
                  <p className="font-medium">{values.homepage || "-"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-medium text-lg mb-2">Financeiro</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Limite de Crédito:</span>
                  <p className="font-medium">R$ {values.limite || "0,00"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Crédito Bloqueado:</span>
                  <p className="font-medium">{values.creditobloqueado ? "Sim" : "Não"}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm text-muted-foreground">Observações:</span>
                  <p className="font-medium">{values.observacao || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-1">
        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-bold">Cadastro de Cliente</h2>
          <p className="text-muted-foreground">Complete as informações em cada etapa</p>
        </div>

        {/* Indicador de progresso */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />

          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  "flex flex-col items-center cursor-pointer transition-all",
                  index === currentStep ? "scale-110" : "scale-100 opacity-70",
                  index > currentStep && !stepCompleted[index - 1] && "cursor-not-allowed opacity-50",
                )}
                onClick={() => goToStep(index)}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border",
                    index < currentStep || stepCompleted[index]
                      ? "bg-primary text-primary-foreground border-primary"
                      : index === currentStep
                        ? "border-primary text-primary"
                        : "border-muted-foreground text-muted-foreground",
                  )}
                >
                  {index < currentStep || stepCompleted[index] ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </div>
                <span
                  className={cn("text-xs mt-1 hidden md:block", index === currentStep ? "font-medium" : "font-normal")}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={nextStep}>
                Próximo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Cliente
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

