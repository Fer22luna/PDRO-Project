import { Regulation, RegulationType, WorkflowState } from '@/types';

export const mockRegulations: Regulation[] = [
  {
    id: '1',
    type: 'DECREE',
    specialNumber: 'D-2024-001',
    publicationDate: new Date('2024-01-15'),
    reference: 'Decreto sobre Presupuesto Anual 2024',
    content: `# Decreto sobre Presupuesto Anual 2024

## Artículo 1
Se aprueba el presupuesto anual para el ejercicio fiscal 2024 por un monto de $50,000,000.

## Artículo 2
Los recursos serán distribuidos según el siguiente detalle:
- Infraestructura: 40%
- Educación: 30%
- Salud: 20%
- Otros: 10%

## Artículo 3
La ejecución presupuestaria será supervisada por la Dirección de Finanzas.`,
    keywords: ['presupuesto', 'finanzas', '2024', 'recursos'],
    state: 'PUBLISHED',
    stateHistory: [
      {
        fromState: null,
        toState: 'DRAFT',
        timestamp: new Date('2024-01-01'),
        userId: 'user1',
        userRole: 'ADMIN',
      },
      {
        fromState: 'DRAFT',
        toState: 'REVIEW',
        timestamp: new Date('2024-01-05'),
        userId: 'user1',
        userRole: 'ADMIN',
      },
      {
        fromState: 'REVIEW',
        toState: 'APPROVED',
        timestamp: new Date('2024-01-10'),
        userId: 'user2',
        userRole: 'REVIEWER',
      },
      {
        fromState: 'APPROVED',
        toState: 'PUBLISHED',
        timestamp: new Date('2024-01-15'),
        userId: 'user3',
        userRole: 'DIRECTOR',
      },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    type: 'RESOLUTION',
    specialNumber: 'R-2024-005',
    publicationDate: new Date('2024-02-20'),
    reference: 'Resolución sobre Contratación de Personal',
    content: `# Resolución sobre Contratación de Personal

## Considerando
Que es necesario fortalecer el equipo de trabajo de la institución.

## Se Resuelve
Autorizar la contratación de 10 nuevos funcionarios para las áreas de:
- Administración: 3 personas
- Tecnología: 4 personas
- Servicios Generales: 3 personas

Los procesos de selección se realizarán conforme a las normativas vigentes.`,
    keywords: ['personal', 'contratación', 'recursos humanos'],
    state: 'PUBLISHED',
    stateHistory: [
      {
        fromState: null,
        toState: 'DRAFT',
        timestamp: new Date('2024-02-01'),
        userId: 'user1',
        userRole: 'ADMIN',
      },
      {
        fromState: 'DRAFT',
        toState: 'REVIEW',
        timestamp: new Date('2024-02-10'),
        userId: 'user1',
        userRole: 'ADMIN',
      },
      {
        fromState: 'REVIEW',
        toState: 'APPROVED',
        timestamp: new Date('2024-02-15'),
        userId: 'user2',
        userRole: 'REVIEWER',
      },
      {
        fromState: 'APPROVED',
        toState: 'PUBLISHED',
        timestamp: new Date('2024-02-20'),
        userId: 'user3',
        userRole: 'DIRECTOR',
      },
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-20'),
  },
  {
    id: '3',
    type: 'ORDINANCE',
    specialNumber: 'O-2024-012',
    publicationDate: new Date('2024-03-10'),
    reference: 'Ordenanza Municipal sobre Gestión de Residuos',
    content: `# Ordenanza Municipal sobre Gestión de Residuos

## Capítulo I - Disposiciones Generales
Esta ordenanza tiene por objeto regular la gestión integral de residuos sólidos en el municipio.

## Capítulo II - Obligaciones
Todos los ciudadanos deberán:
1. Separar los residuos en orgánicos e inorgánicos
2. Depositar los residuos en los contenedores correspondientes
3. Respetar los horarios de recolección

## Capítulo III - Sanciones
El incumplimiento será sancionado según lo establecido en el reglamento.`,
    keywords: ['medio ambiente', 'residuos', 'gestión municipal', 'ordenanza'],
    state: 'PUBLISHED',
    stateHistory: [
      {
        fromState: null,
        toState: 'DRAFT',
        timestamp: new Date('2024-02-15'),
        userId: 'user1',
        userRole: 'ADMIN',
      },
      {
        fromState: 'DRAFT',
        toState: 'REVIEW',
        timestamp: new Date('2024-02-25'),
        userId: 'user1',
        userRole: 'ADMIN',
      },
      {
        fromState: 'REVIEW',
        toState: 'APPROVED',
        timestamp: new Date('2024-03-05'),
        userId: 'user2',
        userRole: 'REVIEWER',
      },
      {
        fromState: 'APPROVED',
        toState: 'PUBLISHED',
        timestamp: new Date('2024-03-10'),
        userId: 'user3',
        userRole: 'DIRECTOR',
      },
    ],
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-03-10'),
  },
  {
    id: '4',
    type: 'DECREE',
    specialNumber: 'D-2024-008',
    publicationDate: new Date('2024-04-05'),
    reference: 'Decreto de Modernización Tecnológica',
    content: `# Decreto de Modernización Tecnológica

## Artículo 1
Se declara de interés institucional la modernización de los sistemas tecnológicos.

## Artículo 2
Se destinarán recursos para:
- Actualización de infraestructura de red
- Implementación de sistemas de gestión documental
- Capacitación del personal en nuevas tecnologías

## Artículo 3
El plazo de implementación será de 12 meses a partir de la fecha de publicación.`,
    keywords: ['tecnología', 'modernización', 'infraestructura', 'sistemas'],
    state: 'APPROVED',
    stateHistory: [
      {
        fromState: null,
        toState: 'DRAFT',
        timestamp: new Date('2024-03-15'),
        userId: 'user1',
        userRole: 'ADMIN',
      },
      {
        fromState: 'DRAFT',
        toState: 'REVIEW',
        timestamp: new Date('2024-03-25'),
        userId: 'user1',
        userRole: 'ADMIN',
      },
      {
        fromState: 'REVIEW',
        toState: 'APPROVED',
        timestamp: new Date('2024-04-01'),
        userId: 'user2',
        userRole: 'REVIEWER',
      },
    ],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-04-01'),
  },
  {
    id: '5',
    type: 'RESOLUTION',
    specialNumber: 'R-2024-010',
    publicationDate: new Date('2024-05-12'),
    reference: 'Resolución sobre Horarios de Atención',
    content: `# Resolución sobre Horarios de Atención

## Se Resuelve
Establecer los siguientes horarios de atención al público:

**Días hábiles:**
- Lunes a Viernes: 8:00 AM - 4:00 PM
- Sábados: 9:00 AM - 1:00 PM

**Excepciones:**
Los días festivos y feriados nacionales no habrá atención al público.`,
    keywords: ['horarios', 'atención', 'servicios'],
    state: 'REVIEW',
    stateHistory: [
      {
        fromState: null,
        toState: 'DRAFT',
        timestamp: new Date('2024-05-01'),
        userId: 'user1',
        userRole: 'ADMIN',
      },
      {
        fromState: 'DRAFT',
        toState: 'REVIEW',
        timestamp: new Date('2024-05-10'),
        userId: 'user1',
        userRole: 'ADMIN',
      },
    ],
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-10'),
  },
];

export function getRegulations(filter?: {
  type?: RegulationType;
  state?: WorkflowState;
  searchText?: string;
  dateFrom?: Date;
  dateTo?: Date;
}): Regulation[] {
  let filtered = [...mockRegulations];

  if (filter?.type) {
    filtered = filtered.filter((r) => r.type === filter.type);
  }

  if (filter?.state) {
    filtered = filtered.filter((r) => r.state === filter.state);
  }

  if (filter?.searchText) {
    const searchLower = filter.searchText.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.reference.toLowerCase().includes(searchLower) ||
        r.content.toLowerCase().includes(searchLower) ||
        r.keywords.some((k) => k.toLowerCase().includes(searchLower))
    );
  }

  if (filter?.dateFrom) {
    filtered = filtered.filter((r) => r.publicationDate >= filter.dateFrom!);
  }

  if (filter?.dateTo) {
    filtered = filtered.filter((r) => r.publicationDate <= filter.dateTo!);
  }

  return filtered;
}

export function getRegulationById(id: string): Regulation | undefined {
  return mockRegulations.find((r) => r.id === id);
}
