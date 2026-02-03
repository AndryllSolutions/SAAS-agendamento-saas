# Frontend Architecture - Agendamento SaaS Multi-Tenant

## Overview
Aplicação web moderna construída com Next.js 14, TypeScript e Tailwind CSS. Interface responsiva, real-time updates, e arquitetura componentizada para sistema multi-tenant de agendamentos.

## Stack Tecnológico

### Core Framework
- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **React 18**: Componentes e hooks
- **React Server Components**: Renderização híbrida

### UI & Styling
- **Tailwind CSS**: Utility-first CSS
- **shadcn/ui**: Componentes UI modernos
- **Lucide React**: Ícones consistentes
- **Framer Motion**: Animações
- **React Hook Form**: Formulários
- **Zod**: Validação de schemas

### State Management
- **Zustand**: State management leve
- **React Query (TanStack Query)**: Server state
- **React Context**: Tema e autenticação global

### API & Data
- **Axios**: Client HTTP com interceptors
- **React Hook Form + Zod**: Forms validados
- **SWR/React Query**: Cache e sincronização

### DevTools & Build
- **ESLint**: Code quality
- **Prettier**: Code formatting
- **Next.js Bundle Analyzer**: Otimização de bundle
- **Playwright**: E2E tests

## Estrutura de Diretórios

```
frontend/
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── (auth)/            # Grupo de rotas de auth
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/       # Grupo de rotas do dashboard
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── services/
│   │   │   │   └── page.tsx
│   │   │   ├── schedules/
│   │   │   │   ├── page.tsx
│   │   │   │   └── calendar/
│   │   │   │       └── page.tsx
│   │   │   ├── products/
│   │   │   │   └── page.tsx
│   │   │   ├── commands/
│   │   │   │   └── page.tsx
│   │   │   ├── packages/
│   │   │   │   └── page.tsx
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── company/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── notifications/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── integrations/
│   │   │   │       └── page.tsx
│   │   │   ├── reports/
│   │   │   │   └── page.tsx
│   │   │   ├── addons/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (saas)/            # Rotas SaaS Admin
│   │   │   ├── admin/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/               # API Routes
│   │   │   └── auth/
│   │   │       └── [...nextauth]/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx         # Root layout
│   │   ├── loading.tsx        # Loading global
│   │   ├── error.tsx          # Error boundary
│   │   ├── not-found.tsx      # 404 page
│   │   └── page.tsx           # Home/Landing
│   ├── components/            # Componentes reutilizáveis
│   │   ├── ui/               # Componentes base (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── form.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── select.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── radio.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── date-picker.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── sheet.tsx
│   │   │   └── index.ts
│   │   ├── layout/           # Componentes de layout
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── navigation.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   └── loading.tsx
│   │   ├── forms/            # Formulários complexos
│   │   │   ├── client-form.tsx
│   │   │   ├── service-form.tsx
│   │   │   ├── schedule-form.tsx
│   │   │   ├── user-form.tsx
│   │   │   ├── company-form.tsx
│   │   │   └── product-form.tsx
│   │   ├── tables/           # Tabelas de dados
│   │   │   ├── clients-table.tsx
│   │   │   ├── services-table.tsx
│   │   │   ├── schedules-table.tsx
│   │   │   ├── users-table.tsx
│   │   │   ├── products-table.tsx
│   │   │   └── commands-table.tsx
│   │   ├── charts/           # Gráficos e dashboards
│   │   │   ├── revenue-chart.tsx
│   │   │   ├── appointments-chart.tsx
│   │   │   ├── clients-chart.tsx
│   │   │   ├── services-chart.tsx
│   │   │   └── kpi-cards.tsx
│   │   ├── calendar/         # Componentes de calendário
│   │   │   ├── calendar-view.tsx
│   │   │   ├── schedule-grid.tsx
│   │   │   ├── time-slots.tsx
│   │   │   └── availability-picker.tsx
│   │   ├── notifications/    # Sistema de notificações
│   │   │   ├── notification-center.tsx
│   │   │   ├── notification-item.tsx
│   │   │   ├── notification-toast.tsx
│   │   │   └── notification-settings.tsx
│   │   ├── modals/           # Modais e overlays
│   │   │   ├── confirm-modal.tsx
│   │   │   ├── upgrade-modal.tsx
│   │   │   ├── schedule-modal.tsx
│   │   │   ├── client-modal.tsx
│   │   │   └── addon-modal.tsx
│   │   └── common/           # Componentes utilitários
│   │       ├── loading-spinner.tsx
│   │       ├── error-boundary.tsx
│   │       ├── empty-state.tsx
│   │       ├── search-box.tsx
│   │       ├── pagination.tsx
│   │       ├── file-upload.tsx
│   │       └── image-upload.tsx
│   ├── hooks/                # React hooks customizados
│   │   ├── use-auth.ts
│   │   ├── use-company.ts
│   │   ├── use-permissions.ts
│   │   ├── use-feature-access.ts
│   │   ├── use-local-storage.ts
│   │   ├── use-debounce.ts
│   │   ├── use-infinite-scroll.ts
│   │   ├── use-calendar.ts
│   │   ├── use-notifications.ts
│   │   └── use-online-status.ts
│   ├── lib/                  # Utilitários e configurações
│   │   ├── api.ts            # Cliente Axios
│   │   ├── auth.ts           # Funções de auth
│   │   ├── utils.ts          # Funções helper
│   │   ├── constants.ts      # Constantes da app
│   │   ├── validations.ts    # Schemas Zod
│   │   ├── permissions.ts    # Mapeamento de permissões
│   │   ├── features.ts       # Mapeamento de features
│   │   ├── date.ts           # Funções de data
│   │   ├── format.ts         # Formatação (moeda, etc)
│   │   └── storage.ts        # Local storage
│   ├── store/                # State management (Zustand)
│   │   ├── auth-store.ts     # Estado de autenticação
│   │   ├── company-store.ts  # Estado da empresa
│   │   ├── ui-store.ts       # Estado da UI (tema, sidebar)
│   │   ├── notifications-store.ts # Estado de notificações
│   │   └── index.ts          # Export das stores
│   ├── types/                # Tipos TypeScript
│   │   ├── auth.ts
│   │   ├── company.ts
│   │   ├── client.ts
│   │   ├── service.ts
│   │   ├── schedule.ts
│   │   ├── user.ts
│   │   ├── plan.ts
│   │   ├── addon.ts
│   │   ├── notification.ts
│   │   └── api.ts
│   └── styles/               # Estilos globais
│       ├── globals.css
│       ├── components.css
│       └── themes.css
├── public/                   # Assets estáticos
│   ├── icons/
│   ├── images/
│   └── favicon.ico
├── tests/                    # Testes
│   ├── __mocks__/
│   ├── setup.ts
│   ├── components/
│   ├── hooks/
│   └── e2e/
├── docs/                     # Documentação
├── .env.local               # Variáveis de ambiente (local)
├── .env                     # Variáveis de ambiente (padrão)
├── next.config.js           # Configuração Next.js
├── tailwind.config.js       # Configuração Tailwind
├── tsconfig.json            # Configuração TypeScript
├── package.json             # Dependências
└── README.md
```

## Arquitetura de Componentes

### 1. Atomic Design
```
atoms/     → Componentes indivisíveis (Button, Input)
molecules/ → Combinações de atoms (FormField, SearchBox)
organisms/ → Estruturas complexas (Header, Table)
templates/ → Layouts com placeholders
pages/      → Templates com dados reais
```

### 2. Component Structure
```typescript
// Exemplo: ClientCard
interface ClientCardProps {
  client: Client;
  onEdit?: (client: Client) => void;
  onDelete?: (id: number) => void;
  onView?: (client: Client) => void;
}

export function ClientCard({ 
  client, 
  onEdit, 
  onDelete, 
  onView 
}: ClientCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{client.name}</h3>
          <p className="text-sm text-muted-foreground">{client.email}</p>
          <p className="text-sm text-muted-foreground">{client.phone}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onView?.(client)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit?.(client)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete?.(client.id)}>
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

## State Management

### Zustand Stores
```typescript
// store/auth-store.ts
interface AuthState {
  user: User | null;
  company: Company | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  company: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(credentials);
      set({
        user: response.user,
        company: response.company,
        accessToken: response.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: () => {
    set({
      user: null,
      company: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },
}));
```

### React Query para Server State
```typescript
// hooks/use-clients.ts
export function useClients(params?: ClientsParams) {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => clientService.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: clientService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar cliente');
    },
  });
}
```

## Sistema de Autenticação

### Auth Provider
```typescript
// components/auth-provider.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, accessToken, isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    // Verificar token ao carregar
    const token = localStorage.getItem('access_token');
    if (token && !isAuthenticated) {
      // Validar token e carregar usuário
    }
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Route Protection
```typescript
// app/(dashboard)/layout.tsx
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
```

## Sistema de Permissões

### Hook de Feature Access
```typescript
// hooks/use-feature-access.ts
export function useFeatureAccess(feature: string) {
  const { company } = useAuthStore();
  
  const { data: hasAccess } = useQuery({
    queryKey: ['feature-access', feature],
    queryFn: () => planService.checkFeatureAccess(feature),
    enabled: !!company,
  });
  
  return {
    hasAccess: hasAccess?.has_access || false,
    requiredPlan: hasAccess?.required_plan,
    isBlocked: hasAccess?.has_access === false,
  };
}

// Uso em componente
function ReportsButton() {
  const { hasAccess, isBlocked } = useFeatureAccess('advanced_reports');
  
  if (isBlocked) {
    return (
      <Button disabled>
        <BarChart3 className="w-4 h-4 mr-2" />
        Relatórios (Premium)
      </Button>
    );
  }
  
  return (
    <Button>
      <BarChart3 className="w-4 h-4 mr-2" />
      Relatórios
    </Button>
  );
}
```

## Sistema de UI

### Design System
```typescript
// lib/constants.ts
export const APP_CONFIG = {
  name: 'Agendamento SaaS',
  description: 'Sistema completo de agendamento',
  version: '1.0.0',
  
  // Tema
  theme: {
    colors: {
      primary: '#8b5cf6',
      secondary: '#64748b',
      accent: '#f59e0b',
      destructive: '#ef4444',
    },
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};
```

### Componentes UI (shadcn/ui)
```typescript
// components/ui/button.tsx
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

## Formulários e Validação

### React Hook Form + Zod
```typescript
// components/forms/client-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const clientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  date_of_birth: z.date().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  initialData?: Partial<Client>;
  onSubmit: (data: ClientFormData) => Promise<void>;
}

export function ClientForm({ initialData, onSubmit }: ClientFormProps) {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData,
  });
  
  const handleSubmit = async (data: ClientFormData) => {
    await onSubmit(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do cliente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" placeholder="cliente@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input placeholder="(11) 99999-9999" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          Salvar Cliente
        </Button>
      </form>
    </Form>
  );
}
```

## Sistema de Calendário

### Componente de Calendário
```typescript
// components/calendar/calendar-view.tsx
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  selectedDate: Date;
  schedules: Schedule[];
  onDateSelect: (date: Date) => void;
  onScheduleClick: (schedule: Schedule) => void;
}

export function CalendarView({ 
  selectedDate, 
  schedules, 
  onDateSelect, 
  onScheduleClick 
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const getSchedulesForDay = (day: Date) => {
    return schedules.filter(schedule => 
      isSameDay(new Date(schedule.date), day)
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center text-sm font-medium p-2">
              {day}
            </div>
          ))}
          
          {monthDays.map(day => {
            const daySchedules = getSchedulesForDay(day);
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            
            return (
              <div
                key={day.toString()}
                className={cn(
                  'min-h-[80px] p-2 border rounded cursor-pointer transition-colors',
                  isSelected && 'border-primary bg-primary/10',
                  !isCurrentMonth && 'opacity-50',
                  'hover:bg-accent'
                )}
                onClick={() => onDateSelect(day)}
              >
                <div className="text-sm font-medium">{format(day, 'd')}</div>
                {daySchedules.length > 0 && (
                  <div className="mt-1">
                    <div className="text-xs text-muted-foreground">
                      {daySchedules.length} agendamento(s)
                    </div>
                    {daySchedules.slice(0, 2).map(schedule => (
                      <div
                        key={schedule.id}
                        className="text-xs truncate bg-primary/20 rounded px-1 mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onScheduleClick(schedule);
                        }}
                      >
                        {schedule.service.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Sistema de Notificações

### Notification Center
```typescript
// components/notifications/notification-center.tsx
import { Bell } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/use-notifications';

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Notificações</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma notificação
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
```

## Performance e Otimização

### Code Splitting
```typescript
// Lazy loading de componentes
import dynamic from 'next/dynamic';

const ScheduleModal = dynamic(() => import('@/components/modals/schedule-modal'), {
  loading: () => <div>Carregando...</div>,
  ssr: false,
});

// Uso
function ScheduleButton() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Novo Agendamento
      </Button>
      
      {isOpen && (
        <ScheduleModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
```

### Memoização
```typescript
// Componentes pesados com React.memo
export const ClientTable = React.memo<ClientTableProps>(({ clients, onEdit, onDelete }) => {
  // Renderização otimizada
});

// Callbacks com useMemo
const filteredClients = useMemo(() => {
  return clients.filter(client => 
    client.name.toLowerCase().includes(search.toLowerCase())
  );
}, [clients, search]);
```

### Virtual Scrolling
```typescript
// Para listas grandes
import { FixedSizeList as List } from 'react-window';

function VirtualizedClientList({ clients }: { clients: Client[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <ClientCard client={clients[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={clients.length}
      itemSize={120}
    >
      {Row}
    </List>
  );
}
```

## Testes

### Unit Tests
```typescript
// __tests__/components/client-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ClientCard } from '@/components/tables/client-card';

const mockClient = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  phone: '(11) 99999-9999',
};

describe('ClientCard', () => {
  it('renders client information correctly', () => {
    render(<ClientCard client={mockClient} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<ClientCard client={mockClient} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    expect(onEdit).toHaveBeenCalledWith(mockClient);
  });
});
```

### E2E Tests (Playwright)
```typescript
// tests/e2e/client-management.spec.ts
import { test, expect } from '@playwright/test';

test('should create a new client', async ({ page }) => {
  await page.goto('/clients');
  
  // Clicar no botão de novo cliente
  await page.click('[data-testid="new-client-button"]');
  
  // Preencher formulário
  await page.fill('[data-testid="client-name"]', 'John Doe');
  await page.fill('[data-testid="client-email"]', 'john@example.com');
  await page.fill('[data-testid="client-phone"]', '(11) 99999-9999');
  
  // Submeter
  await page.click('[data-testid="save-client-button"]');
  
  // Verificar se foi criado
  await expect(page.locator('text=John Doe')).toBeVisible();
  await expect(page.locator('text=Cliente criado com sucesso!')).toBeVisible();
});
```

## Deploy

### Build Optimization
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otimizações de produção
  swcMinify: true,
  
  // Imagens
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Bundle analyzer
  webpack: (config, { isDev }) => {
    if (!isDev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;
```

### Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=base /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]
```

## Monitoramento e Analytics

### Performance Monitoring
```typescript
// lib/analytics.ts
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }
}

// Uso
trackEvent('client_created', {
  client_id: client.id,
  company_id: company.id,
});
```

### Error Tracking
```typescript
// components/error-boundary.tsx
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Enviar para serviço de monitoramento
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Algo deu errado</h2>
            <p className="text-muted-foreground mb-4">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <Button onClick={() => window.location.reload()}>
              Recarregar Página
            </Button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## Próximos Passos

### Roadmap Frontend
1. **PWA**: Progressive Web App
2. **Offline Support**: Service Workers
3. **WebSockets**: Tempo real
4. **Mobile App**: React Native
5. **Component Library**: Storybook

### Otimizações Futuras
1. **Micro-frontends**: Módulos independentes
2. **Edge Computing**: CDN + Edge Functions
3. **AI/ML**: Recomendações inteligentes
4. **Voice Interface**: Comandos por voz
5. **AR/VR**: Experiência imersiva
