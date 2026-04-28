"use client";

import { useMemo, useState } from "react";
import {
  structuralAudienceLabels,
  type StructuralAudience,
  type StructuralJobPosition,
} from "../pronus-data";

type CollaboratorsTab = "users" | "permissions" | "schedule" | "holidays" | "rates";

type PersonStatus = "active" | "pending" | "suspended" | "cancelled";

type Person = {
  id: string;
  name: string;
  cpf: string;
  email: string;
  registeredAt: string;
  company?: string;
  department: string;
  jobPosition: string;
  audience: StructuralAudience;
  status: PersonStatus;
};

type UserForm = Omit<Person, "id">;

type PermissionKey =
  | "companyRegistration"
  | "clientRecords"
  | "medicalRecords"
  | "psychosocialReports"
  | "schedule"
  | "billing";

type PermissionProfile = {
  jobPosition: string;
  audience: StructuralAudience;
  permissions: Record<PermissionKey, boolean>;
};

type Weekday = "mon" | "tue" | "wed" | "thu" | "fri";

type ScheduleItem = {
  id: string;
  clinician: string;
  specialty: string;
  startDate: string;
  start: string;
  end: string;
  appointmentMinutes: number;
  weekdays: Weekday[];
  status: "available" | "blocked";
};

type ScheduleForm = Omit<ScheduleItem, "id" | "status">;

type BlockForm = {
  clinician: string;
  date: string;
  dates: string[];
};

type BlockedSchedule = {
  id: string;
  clinician: string;
  dates: string[];
  reason: string;
};

type HolidayItem = {
  id: string;
  date: string;
  name: string;
  scope: string;
  status: "active" | "inactive";
};

type HolidayForm = Omit<HolidayItem, "id" | "status">;

type RateItem = {
  id: string;
  clinician: string;
  appointmentMinutes: number;
  value: number;
  startDate: string;
  endDate?: string;
};

type RateForm = Omit<RateItem, "id" | "endDate">;

const standardPassword = "pronu123";

const tabs: Array<{ id: CollaboratorsTab; label: string }> = [
  { id: "users", label: "Usuarios" },
  { id: "permissions", label: "Permissoes do sistema" },
  { id: "schedule", label: "Agenda" },
  { id: "holidays", label: "Feriados" },
  { id: "rates", label: "Tabela" },
];

const weekdays: Array<{ id: Weekday; label: string; title: string }> = [
  { id: "mon", label: "Seg", title: "Segunda-feira" },
  { id: "tue", label: "Ter", title: "Terca-feira" },
  { id: "wed", label: "Qua", title: "Quarta-feira" },
  { id: "thu", label: "Qui", title: "Quinta-feira" },
  { id: "fri", label: "Sex", title: "Sexta-feira" },
];

const permissionLabels: Record<PermissionKey, string> = {
  companyRegistration: "Cadastro de empresas",
  clientRecords: "Clientes das empresas",
  medicalRecords: "Prontuarios",
  psychosocialReports: "Relatorios psicossociais",
  schedule: "Agenda clinica",
  billing: "Financeiro",
};

const statusClasses: Record<PersonStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  suspended: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const statusLabels: Record<PersonStatus, string> = {
  active: "Ativo",
  pending: "Primeiro acesso",
  suspended: "Suspenso",
  cancelled: "Cancelado",
};

const initialUsers: Person[] = [
  {
    id: "rh-industria-mariana",
    name: "Mariana Costa",
    cpf: "123.456.789-09",
    email: "rh@industriahorizonte.com.br",
    registeredAt: "2026-03-02",
    company: "Industria Horizonte",
    department: "Recursos Humanos",
    jobPosition: "RH cliente",
    audience: "client_hr",
    status: "active",
  },
  {
    id: "rh-rede-paulo",
    name: "Paulo Mendes",
    cpf: "321.654.987-00",
    email: "rh@redenorte.com.br",
    registeredAt: "2026-03-18",
    company: "Rede Norte",
    department: "Recursos Humanos",
    jobPosition: "Gestor cliente",
    audience: "client_manager",
    status: "pending",
  },
  {
    id: "pronus-ana-admin",
    name: "Ana Paula Martins",
    cpf: "456.789.123-88",
    email: "ana.martins@pronus.com.br",
    registeredAt: "2026-02-10",
    department: "Administrativo PRONUS",
    jobPosition: "Analista Administrativo PRONUS",
    audience: "pronus_administrative",
    status: "active",
  },
  {
    id: "pronus-dr-carlos",
    name: "Carlos Henrique Nunes",
    cpf: "654.987.321-11",
    email: "carlos.nunes@pronus.com.br",
    registeredAt: "2026-02-12",
    department: "Corpo Clinico PRONUS",
    jobPosition: "Medico do Trabalho",
    audience: "pronus_clinical",
    status: "active",
  },
  {
    id: "pronus-psi-larissa",
    name: "Larissa Moreira",
    cpf: "789.123.456-22",
    email: "larissa.moreira@pronus.com.br",
    registeredAt: "2026-02-13",
    department: "Corpo Clinico PRONUS",
    jobPosition: "Psicologa Ocupacional",
    audience: "pronus_clinical",
    status: "active",
  },
];

function createEmptyUserForm(): UserForm {
  return {
    audience: "client_hr",
    company: "",
    cpf: "",
    department: "Recursos Humanos",
    email: "",
    jobPosition: "RH cliente",
    name: "",
    registeredAt: todayIso(),
    status: "pending",
  };
}

const initialPermissions: PermissionProfile[] = [
  {
    jobPosition: "RH cliente",
    audience: "client_hr",
    permissions: {
      billing: false,
      clientRecords: true,
      companyRegistration: false,
      medicalRecords: false,
      psychosocialReports: true,
      schedule: false,
    },
  },
  {
    jobPosition: "Gestor cliente",
    audience: "client_manager",
    permissions: {
      billing: true,
      clientRecords: true,
      companyRegistration: false,
      medicalRecords: false,
      psychosocialReports: true,
      schedule: false,
    },
  },
  {
    jobPosition: "Analista Administrativo PRONUS",
    audience: "pronus_administrative",
    permissions: {
      billing: true,
      clientRecords: true,
      companyRegistration: true,
      medicalRecords: false,
      psychosocialReports: false,
      schedule: true,
    },
  },
  {
    jobPosition: "Medico do Trabalho",
    audience: "pronus_clinical",
    permissions: {
      billing: false,
      clientRecords: false,
      companyRegistration: false,
      medicalRecords: true,
      psychosocialReports: false,
      schedule: true,
    },
  },
  {
    jobPosition: "Psicologa Ocupacional",
    audience: "pronus_clinical",
    permissions: {
      billing: false,
      clientRecords: false,
      companyRegistration: false,
      medicalRecords: false,
      psychosocialReports: true,
      schedule: true,
    },
  },
];

const initialSchedule: ScheduleItem[] = [
  {
    id: "schedule-001",
    clinician: "Carlos Henrique Nunes",
    specialty: "Medicina ocupacional",
    startDate: "2026-05-04",
    start: "08:00",
    end: "12:00",
    appointmentMinutes: 20,
    weekdays: ["mon", "wed", "fri"],
    status: "available",
  },
  {
    id: "schedule-002",
    clinician: "Larissa Moreira",
    specialty: "Psicologia",
    startDate: "2026-05-04",
    start: "13:00",
    end: "17:00",
    appointmentMinutes: 30,
    weekdays: ["tue", "thu"],
    status: "available",
  },
];

const initialBlockedSchedules: BlockedSchedule[] = [
  {
    id: "block-001",
    clinician: "Carlos Henrique Nunes",
    dates: ["2026-05-15"],
    reason: "Treinamento externo",
  },
];

const initialHolidays: HolidayItem[] = [
  {
    id: "holiday-001",
    date: "2026-12-25",
    name: "Natal",
    scope: "Nacional",
    status: "active",
  },
  {
    id: "holiday-002",
    date: "2026-01-01",
    name: "Confraternizacao universal",
    scope: "Nacional",
    status: "active",
  },
];

const initialRates: RateItem[] = [
  {
    id: "rate-001",
    clinician: "Carlos Henrique Nunes",
    appointmentMinutes: 20,
    value: 72,
    startDate: "2026-02-01",
  },
  {
    id: "rate-002",
    clinician: "Larissa Moreira",
    appointmentMinutes: 30,
    value: 90,
    startDate: "2026-02-01",
  },
];

const emptyScheduleForm: ScheduleForm = {
  appointmentMinutes: 20,
  clinician: "Carlos Henrique Nunes",
  end: "",
  specialty: "Medicina ocupacional",
  start: "",
  startDate: "",
  weekdays: ["mon", "wed", "fri"],
};

const emptyBlockForm: BlockForm = {
  clinician: "Carlos Henrique Nunes",
  date: "",
  dates: [],
};

const emptyHolidayForm: HolidayForm = {
  date: "",
  name: "",
  scope: "Nacional",
};

const emptyRateForm: RateForm = {
  appointmentMinutes: 20,
  clinician: "Carlos Henrique Nunes",
  startDate: "",
  value: 0,
};

export function CollaboratorsWorkforcePanel({
  jobPositions,
}: Readonly<{ jobPositions: StructuralJobPosition[] }>) {
  const [activeTab, setActiveTab] = useState<CollaboratorsTab>("users");
  const [users, setUsers] = useState(initialUsers);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [blockedSchedules, setBlockedSchedules] = useState(initialBlockedSchedules);
  const [holidays, setHolidays] = useState(initialHolidays);
  const [rates, setRates] = useState(initialRates);
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>(emptyScheduleForm);
  const [blockForm, setBlockForm] = useState<BlockForm>(emptyBlockForm);
  const [holidayForm, setHolidayForm] = useState<HolidayForm>(emptyHolidayForm);
  const [rateForm, setRateForm] = useState<RateForm>(emptyRateForm);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [isHolidayOpen, setIsHolidayOpen] = useState(false);
  const [isRateOpen, setIsRateOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const clinicalPeople = users.filter((person) => person.audience === "pronus_clinical");
  const roleOptions = useMemo(
    () =>
      jobPositions.filter(
        (position) =>
          position.audience === "client_hr" ||
          position.audience === "client_manager" ||
          position.audience === "pronus_administrative" ||
          position.audience === "pronus_clinical",
      ),
    [jobPositions],
  );

  function updateUserStatus(id: string, status: PersonStatus) {
    setUsers((current) =>
      current.map((person) => (person.id === id ? { ...person, status } : person)),
    );
    setMessage(`Usuario ${statusLabels[status].toLowerCase()} com sucesso.`);
  }

  function resetPassword(person: Person) {
    setMessage(
      `Senha de ${person.name} redefinida para ${standardPassword}. O proximo acesso exigira troca de senha.`,
    );
  }

  function addUser(form: UserForm) {
    setUsers((current) => [
      {
        ...form,
        company: form.company?.trim().length ? form.company : undefined,
        id: `user-${current.length + 1}-${form.cpf.replace(/\D/g, "") || todayIso()}`,
      },
      ...current,
    ]);
    setMessage(`Usuario ${form.name} cadastrado com senha inicial ${standardPassword}.`);
  }

  function togglePermission(profileIndex: number, permission: PermissionKey) {
    setPermissions((current) =>
      current.map((profile, index) =>
        index === profileIndex
          ? {
              ...profile,
              permissions: {
                ...profile.permissions,
                [permission]: !profile.permissions[permission],
              },
            }
          : profile,
      ),
    );
    setMessage("Permissao ajustada para o perfil selecionado.");
  }

  function updateScheduleForm(field: keyof ScheduleForm, value: string) {
    setScheduleForm((current) => ({
      ...current,
      [field]: field === "appointmentMinutes" ? Number(value) : value,
    }));
  }

  function toggleWeekday(day: Weekday) {
    setScheduleForm((current) => ({
      ...current,
      weekdays: current.weekdays.includes(day)
        ? current.weekdays.filter((weekday) => weekday !== day)
        : [...current.weekdays, day],
    }));
  }

  function submitSchedule() {
    if (
      scheduleForm.clinician.length === 0 ||
      scheduleForm.startDate.length === 0 ||
      scheduleForm.start.length === 0 ||
      scheduleForm.end.length === 0 ||
      scheduleForm.weekdays.length === 0 ||
      scheduleForm.appointmentMinutes <= 0
    ) {
      setMessage("Preencha profissional, vigencia, horario, tempo da consulta e dias da semana.");
      return;
    }

    setSchedule((current) => [
      {
        ...scheduleForm,
        id: `schedule-${current.length + 1}-${scheduleForm.startDate}`,
        status: "available",
      },
      ...current,
    ]);
    setIsScheduleOpen(false);
    setScheduleForm(emptyScheduleForm);
    setMessage("Agenda cadastrada com calculo automatico de vagas por dia.");
  }

  function addBlockedDate() {
    if (blockForm.date.length === 0 || blockForm.dates.includes(blockForm.date)) {
      return;
    }

    setBlockForm((current) => ({
      ...current,
      date: "",
      dates: [...current.dates, current.date].sort(),
    }));
  }

  function removeBlockedDate(date: string) {
    setBlockForm((current) => ({
      ...current,
      dates: current.dates.filter((item) => item !== date),
    }));
  }

  function submitBlock() {
    if (blockForm.clinician.length === 0 || blockForm.dates.length === 0) {
      setMessage("Selecione profissional e ao menos uma data para bloquear agenda.");
      return;
    }

    setBlockedSchedules((current) => [
      {
        clinician: blockForm.clinician,
        dates: blockForm.dates,
        id: `block-${current.length + 1}`,
        reason: "Bloqueio operacional",
      },
      ...current,
    ]);
    setBlockForm(emptyBlockForm);
    setIsBlockOpen(false);
    setMessage("Agenda bloqueada para as datas selecionadas.");
  }

  function submitHoliday() {
    if (holidayForm.name.trim().length === 0 || holidayForm.date.length === 0) {
      setMessage("Preencha nome e data do feriado.");
      return;
    }

    setHolidays((current) => [
      {
        ...holidayForm,
        id: `holiday-${current.length + 1}`,
        status: "active",
      },
      ...current,
    ]);
    setHolidayForm(emptyHolidayForm);
    setIsHolidayOpen(false);
    setMessage("Feriado cadastrado e removido da disponibilidade do cliente.");
  }

  function submitRate() {
    if (
      rateForm.clinician.length === 0 ||
      rateForm.startDate.length === 0 ||
      rateForm.appointmentMinutes <= 0 ||
      rateForm.value <= 0
    ) {
      setMessage("Preencha profissional, tempo, valor e data de inicio da tabela.");
      return;
    }

    const today = todayIso();

    setRates((current) => [
      {
        ...rateForm,
        id: `rate-${current.length + 1}`,
      },
      ...current.map((rate) =>
        rate.clinician === rateForm.clinician && rate.endDate === undefined
          ? { ...rate, endDate: today }
          : rate,
      ),
    ]);
    setRateForm(emptyRateForm);
    setIsRateOpen(false);
    setMessage("Tabela cadastrada e tabela anterior do profissional inativada quando existente.");
  }

  function inactivateRate(id: string) {
    setRates((current) =>
      current.map((rate) => (rate.id === id ? { ...rate, endDate: todayIso() } : rate)),
    );
    setMessage("Tabela inativada com data fim registrada.");
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`rounded-md px-3 py-2 text-sm font-semibold ${
                activeTab === tab.id
                  ? "bg-pronus-primary text-white"
                  : "border border-slate-200 bg-white text-slate-700"
              }`}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setMessage(null);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {message !== null && (
        <div className="mx-5 mt-4 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-800">
          {message}
        </div>
      )}

      {activeTab === "users" && (
        <UsersTab
          users={users}
          onAddUser={addUser}
          onResetPassword={resetPassword}
          onUpdateStatus={updateUserStatus}
        />
      )}
      {activeTab === "permissions" && (
        <PermissionsTab
          permissions={permissions}
          roleOptions={roleOptions}
          onToggle={togglePermission}
        />
      )}
      {activeTab === "schedule" && (
        <ScheduleTab
          blockForm={blockForm}
          blockedSchedules={blockedSchedules}
          clinicalPeople={clinicalPeople}
          form={scheduleForm}
          isBlockOpen={isBlockOpen}
          isOpen={isScheduleOpen}
          schedule={schedule}
          setBlockForm={setBlockForm}
          setIsBlockOpen={setIsBlockOpen}
          setIsOpen={setIsScheduleOpen}
          updateForm={updateScheduleForm}
          onAddBlockedDate={addBlockedDate}
          onRemoveBlockedDate={removeBlockedDate}
          onSubmit={submitSchedule}
          onSubmitBlock={submitBlock}
          onToggleWeekday={toggleWeekday}
        />
      )}
      {activeTab === "holidays" && (
        <HolidaysTab
          form={holidayForm}
          holidays={holidays}
          isOpen={isHolidayOpen}
          setForm={setHolidayForm}
          setIsOpen={setIsHolidayOpen}
          onSubmit={submitHoliday}
        />
      )}
      {activeTab === "rates" && (
        <RatesTab
          clinicalPeople={clinicalPeople}
          form={rateForm}
          isOpen={isRateOpen}
          rates={rates}
          setForm={setRateForm}
          setIsOpen={setIsRateOpen}
          onInactivate={inactivateRate}
          onSubmit={submitRate}
        />
      )}
    </section>
  );
}

function UsersTab({
  onAddUser,
  onResetPassword,
  onUpdateStatus,
  users,
}: Readonly<{
  onAddUser: (form: UserForm) => void;
  onResetPassword: (person: Person) => void;
  onUpdateStatus: (id: string, status: PersonStatus) => void;
  users: Person[];
}>) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PersonStatus | "all">("all");
  const [hasSearched, setHasSearched] = useState(false);
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<UserForm>(() => createEmptyUserForm());
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    if (!hasSearched) {
      return [];
    }

    const normalizedQuery = submittedSearch.trim().toLowerCase();

    return users.filter((person) => {
      const text = [
        person.name,
        person.cpf,
        person.jobPosition,
        person.email,
        statusLabels[person.status],
        person.status,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = normalizedQuery.length === 0 || text.includes(normalizedQuery);
      const matchesStatus = status === "all" || person.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [hasSearched, status, submittedSearch, users]);

  function searchUsers() {
    if (query.trim().length === 0 && status === "all") {
      setLocalMessage("Informe CPF, nome, cargo ou status para buscar usuarios.");
      setHasSearched(false);
      return;
    }

    setLocalMessage(null);
    setSubmittedSearch(query);
    setHasSearched(true);
  }

  function clearSearch() {
    setQuery("");
    setStatus("all");
    setSubmittedSearch("");
    setHasSearched(false);
    setLocalMessage(null);
  }

  function submitUser() {
    if (
      form.name.trim().length === 0 ||
      form.cpf.trim().length === 0 ||
      form.email.trim().length === 0 ||
      form.jobPosition.trim().length === 0
    ) {
      setLocalMessage("Preencha nome, CPF, e-mail e cargo para incluir usuario.");
      return;
    }

    onAddUser(form);
    setForm(createEmptyUserForm());
    setIsFormOpen(false);
    setLocalMessage("Usuario incluido. Pesquise para visualizar o registro na lista.");
  }

  return (
    <div className="p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-base font-semibold">Usuarios</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
            {hasSearched ? filteredUsers.length : users.length} registros
          </span>
          <button
            aria-label="Incluir usuario"
            className="flex h-10 w-10 items-center justify-center rounded-md bg-pronus-primary text-xl font-semibold leading-none text-white"
            title="Incluir usuario"
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
          >
            +
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-500">Pesquisar</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
              placeholder="CPF, nome ou cargo"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <SelectField
            label="Status"
            value={status}
            onChange={(value) => setStatus(value as PersonStatus | "all")}
            options={[
              { label: "Todos", value: "all" },
              { label: statusLabels.active, value: "active" },
              { label: statusLabels.pending, value: "pending" },
              { label: statusLabels.suspended, value: "suspended" },
              { label: statusLabels.cancelled, value: "cancelled" },
            ]}
          />
          <div className="flex items-end gap-2">
            <button
              className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white"
              type="button"
              onClick={searchUsers}
            >
              Buscar
            </button>
            <button
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              type="button"
              onClick={clearSearch}
            >
              Limpar
            </button>
          </div>
        </div>
        {localMessage !== null && (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
            {localMessage}
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Field
              label="Nome"
              value={form.name}
              onChange={(value) => setForm((current) => ({ ...current, name: value }))}
            />
            <Field
              label="CPF"
              value={form.cpf}
              onChange={(value) => setForm((current) => ({ ...current, cpf: value }))}
            />
            <Field
              label="E-mail"
              value={form.email}
              onChange={(value) => setForm((current) => ({ ...current, email: value }))}
            />
            <Field
              label="Data cadastro"
              type="date"
              value={form.registeredAt}
              onChange={(value) => setForm((current) => ({ ...current, registeredAt: value }))}
            />
            <SelectField
              label="Perfil"
              value={form.audience}
              onChange={(value) =>
                setForm((current) => ({ ...current, audience: value as StructuralAudience }))
              }
              options={[
                { label: structuralAudienceLabels.client_hr, value: "client_hr" },
                { label: structuralAudienceLabels.client_manager, value: "client_manager" },
                {
                  label: structuralAudienceLabels.pronus_administrative,
                  value: "pronus_administrative",
                },
                { label: structuralAudienceLabels.pronus_clinical, value: "pronus_clinical" },
              ]}
            />
            <Field
              label="Vinculo"
              value={form.company ?? ""}
              onChange={(value) => setForm((current) => ({ ...current, company: value }))}
            />
            <Field
              label="Departamento"
              value={form.department}
              onChange={(value) => setForm((current) => ({ ...current, department: value }))}
            />
            <Field
              label="Cargo"
              value={form.jobPosition}
              onChange={(value) => setForm((current) => ({ ...current, jobPosition: value }))}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white"
              type="button"
              onClick={submitUser}
            >
              Salvar usuario
            </button>
            <button
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              type="button"
              onClick={() => {
                setForm(createEmptyUserForm());
                setIsFormOpen(false);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-[1320px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Nome</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">CPF</th>
              <th className="px-4 py-3 font-semibold">Cadastro</th>
              <th className="px-4 py-3 font-semibold">Perfil</th>
              <th className="px-4 py-3 font-semibold">Vinculo</th>
              <th className="px-4 py-3 font-semibold">Cargo</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Acoes</th>
              <th className="px-4 py-3 font-semibold">Senha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!hasSearched ? (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-500" colSpan={9}>
                  Use a pesquisa para listar usuarios. A tela permanece limpa ate existir uma
                  consulta.
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-500" colSpan={9}>
                  Nenhum usuario encontrado para os criterios informados.
                </td>
              </tr>
            ) : (
              filteredUsers.map((person) => (
                <tr key={person.id}>
                  <td className="px-4 py-3">
                    <strong className="block font-semibold">{person.name}</strong>
                    <span className="mt-1 block text-xs text-slate-500">{person.email}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{person.cpf}</td>
                  <td className="whitespace-nowrap px-4 py-3">{dateLabel(person.registeredAt)}</td>
                  <td className="px-4 py-3">{structuralAudienceLabels[person.audience]}</td>
                  <td className="px-4 py-3">{person.company ?? "PRONUS"}</td>
                  <td className="px-4 py-3">{person.jobPosition}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[person.status]}`}
                    >
                      {statusLabels[person.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      aria-label={`Acoes de ${person.name}`}
                      className="w-36 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
                      value=""
                      onChange={(event) => {
                        const nextStatus = event.target.value;

                        if (isPersonStatus(nextStatus)) {
                          onUpdateStatus(person.id, nextStatus);
                        }
                      }}
                    >
                      <option value="">Selecionar</option>
                      {person.status !== "active" && <option value="active">Ativar</option>}
                      {person.status === "active" && <option value="suspended">Suspender</option>}
                      {person.status !== "cancelled" && <option value="cancelled">Cancelar</option>}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      aria-label={`Resete de senha de ${person.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:border-pronus-primary hover:text-pronus-primary"
                      title="Resete de senha"
                      type="button"
                      onClick={() => onResetPassword(person)}
                    >
                      <KeyIcon />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PermissionsTab({
  onToggle,
  permissions,
  roleOptions,
}: Readonly<{
  onToggle: (profileIndex: number, permission: PermissionKey) => void;
  permissions: PermissionProfile[];
  roleOptions: StructuralJobPosition[];
}>) {
  const keys = Object.keys(permissionLabels) as PermissionKey[];

  return (
    <div className="p-5">
      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <div>
          <h3 className="text-base font-semibold">Permissoes por cargo</h3>
          <p className="mt-1 text-sm text-slate-500">
            Configure visibilidade por perfil para reduzir erro, proteger dados sensiveis e deixar
            claro o que cada cargo pode acessar.
          </p>
        </div>
        <div className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
          {roleOptions.length} cargos parametrizaveis
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Cargo</th>
              {keys.map((key) => (
                <th key={key} className="px-4 py-3 text-center font-semibold">
                  {permissionLabels[key]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {permissions.map((profile, profileIndex) => (
              <tr key={profile.jobPosition}>
                <td className="px-4 py-3">
                  <strong className="block font-semibold">{profile.jobPosition}</strong>
                  <span className="mt-1 block text-xs text-slate-500">
                    {structuralAudienceLabels[profile.audience]}
                  </span>
                </td>
                {keys.map((key) => (
                  <td key={key} className="px-4 py-3 text-center">
                    <label className="inline-flex cursor-pointer items-center justify-center">
                      <input
                        checked={profile.permissions[key]}
                        className="h-4 w-4 rounded border-slate-300 text-pronus-primary"
                        type="checkbox"
                        onChange={() => onToggle(profileIndex, key)}
                      />
                      <span className="sr-only">{permissionLabels[key]}</span>
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScheduleTab({
  blockForm,
  blockedSchedules,
  clinicalPeople,
  form,
  isBlockOpen,
  isOpen,
  onAddBlockedDate,
  onRemoveBlockedDate,
  onSubmit,
  onSubmitBlock,
  onToggleWeekday,
  schedule,
  setBlockForm,
  setIsBlockOpen,
  setIsOpen,
  updateForm,
}: Readonly<{
  blockForm: BlockForm;
  blockedSchedules: BlockedSchedule[];
  clinicalPeople: Person[];
  form: ScheduleForm;
  isBlockOpen: boolean;
  isOpen: boolean;
  onAddBlockedDate: () => void;
  onRemoveBlockedDate: (date: string) => void;
  onSubmit: () => void;
  onSubmitBlock: () => void;
  onToggleWeekday: (day: Weekday) => void;
  schedule: ScheduleItem[];
  setBlockForm: (form: BlockForm | ((current: BlockForm) => BlockForm)) => void;
  setIsBlockOpen: (isOpen: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;
  updateForm: (field: keyof ScheduleForm, value: string) => void;
}>) {
  const calculatedCapacity = calculateSlots(form.start, form.end, form.appointmentMinutes);

  return (
    <div className="p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-base font-semibold">Agenda do corpo clinico</h3>
          <p className="mt-1 text-sm text-slate-500">
            Cadastre disponibilidade, calcule vagas por tempo de consulta e bloqueie datas
            indisponiveis.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            type="button"
            onClick={() => setIsBlockOpen(!isBlockOpen)}
          >
            {isBlockOpen ? "Fechar bloqueio" : "Bloquear agenda"}
          </button>
          <button
            className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "Fechar agenda" : "Nova agenda"}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <SelectField
              label="Profissional"
              value={form.clinician}
              onChange={(value) => updateForm("clinician", value)}
              options={clinicalPeople.map((person) => ({
                label: person.name,
                value: person.name,
              }))}
            />
            <Field
              label="Especialidade"
              value={form.specialty}
              onChange={(value) => updateForm("specialty", value)}
            />
            <Field
              label="Inicio vigencia"
              type="date"
              value={form.startDate}
              onChange={(value) => updateForm("startDate", value)}
            />
            <Field
              label="Inicio"
              type="time"
              value={form.start}
              onChange={(value) => updateForm("start", value)}
            />
            <Field
              label="Fim"
              type="time"
              value={form.end}
              onChange={(value) => updateForm("end", value)}
            />
            <Field
              label="Tempo da consulta (min)"
              type="number"
              value={String(form.appointmentMinutes)}
              onChange={(value) => updateForm("appointmentMinutes", value)}
            />
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px]">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Dias de atendimento</p>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {weekdays.map((weekday) => {
                  const selected = form.weekdays.includes(weekday.id);

                  return (
                    <button
                      key={weekday.id}
                      className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                        selected
                          ? "border-pronus-primary bg-pronus-primary text-white"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                      title={weekday.title}
                      type="button"
                      onClick={() => onToggleWeekday(weekday.id)}
                    >
                      {weekday.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-md bg-white p-3 ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase text-slate-500">Vagas calculadas</p>
              <strong className="mt-1 block text-2xl font-semibold text-slate-900">
                {calculatedCapacity}
              </strong>
              <span className="text-xs text-slate-500">por dia selecionado</span>
            </div>
          </div>
          <button
            className="mt-4 rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white"
            type="button"
            onClick={onSubmit}
          >
            Salvar agenda
          </button>
        </div>
      )}

      {isBlockOpen && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <SelectField
              label="Profissional"
              value={blockForm.clinician}
              onChange={(value) => setBlockForm((current) => ({ ...current, clinician: value }))}
              options={clinicalPeople.map((person) => ({
                label: person.name,
                value: person.name,
              }))}
            />
            <Field
              label="Data bloqueio"
              type="date"
              value={blockForm.date}
              onChange={(value) => setBlockForm((current) => ({ ...current, date: value }))}
            />
            <div className="flex items-end">
              <button
                className="rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800"
                type="button"
                onClick={onAddBlockedDate}
              >
                Adicionar data
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {blockForm.dates.map((date) => (
              <button
                key={date}
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200"
                type="button"
                onClick={() => onRemoveBlockedDate(date)}
              >
                {dateLabel(date)} x
              </button>
            ))}
          </div>
          <button
            className="mt-4 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white"
            type="button"
            onClick={onSubmitBlock}
          >
            Salvar bloqueio
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-[920px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Profissional</th>
              <th className="px-4 py-3 font-semibold">Especialidade</th>
              <th className="px-4 py-3 font-semibold">Vigencia</th>
              <th className="px-4 py-3 font-semibold">Dias</th>
              <th className="px-4 py-3 font-semibold">Horario</th>
              <th className="px-4 py-3 font-semibold">Tempo</th>
              <th className="px-4 py-3 font-semibold">Vagas/dia</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {schedule.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-semibold">{item.clinician}</td>
                <td className="px-4 py-3">{item.specialty}</td>
                <td className="px-4 py-3">{dateLabel(item.startDate)}</td>
                <td className="px-4 py-3">{weekdayLabel(item.weekdays)}</td>
                <td className="px-4 py-3">
                  {item.start} - {item.end}
                </td>
                <td className="px-4 py-3">{item.appointmentMinutes} min</td>
                <td className="px-4 py-3">
                  {calculateSlots(item.start, item.end, item.appointmentMinutes)}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    Disponivel
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 px-4 py-3">
          <h4 className="text-sm font-semibold">Bloqueios cadastrados</h4>
        </div>
        <div className="divide-y divide-slate-100">
          {blockedSchedules.map((blocked) => (
            <div key={blocked.id} className="grid gap-2 px-4 py-3 text-sm md:grid-cols-[1fr_1fr]">
              <strong>{blocked.clinician}</strong>
              <span className="text-slate-600">
                {blocked.dates.map((date) => dateLabel(date)).join(", ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HolidaysTab({
  form,
  holidays,
  isOpen,
  onSubmit,
  setForm,
  setIsOpen,
}: Readonly<{
  form: HolidayForm;
  holidays: HolidayItem[];
  isOpen: boolean;
  onSubmit: () => void;
  setForm: (form: HolidayForm | ((current: HolidayForm) => HolidayForm)) => void;
  setIsOpen: (isOpen: boolean) => void;
}>) {
  return (
    <div className="p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-base font-semibold">Feriados</h3>
          <p className="mt-1 text-sm text-slate-500">
            Datas que interferem no calendario de atendimento e nao aparecem para marcacao.
          </p>
        </div>
        <button
          aria-label="Cadastrar feriado"
          className="flex h-10 w-10 items-center justify-center rounded-md bg-pronus-primary text-xl font-semibold leading-none text-white"
          title="Cadastrar feriado"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          +
        </button>
      </div>

      {isOpen && (
        <div className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_180px_180px_auto]">
          <Field
            label="Feriado"
            value={form.name}
            onChange={(value) => setForm((current) => ({ ...current, name: value }))}
          />
          <Field
            label="Data"
            type="date"
            value={form.date}
            onChange={(value) => setForm((current) => ({ ...current, date: value }))}
          />
          <Field
            label="Abrangencia"
            value={form.scope}
            onChange={(value) => setForm((current) => ({ ...current, scope: value }))}
          />
          <div className="flex items-end">
            <button
              className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white"
              type="button"
              onClick={onSubmit}
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Feriado</th>
              <th className="px-4 py-3 font-semibold">Data</th>
              <th className="px-4 py-3 font-semibold">Abrangencia</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {holidays.map((holiday) => (
              <tr key={holiday.id}>
                <td className="px-4 py-3 font-semibold">{holiday.name}</td>
                <td className="px-4 py-3">{dateLabel(holiday.date)}</td>
                <td className="px-4 py-3">{holiday.scope}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    Ativo
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RatesTab({
  clinicalPeople,
  form,
  isOpen,
  onInactivate,
  onSubmit,
  rates,
  setForm,
  setIsOpen,
}: Readonly<{
  clinicalPeople: Person[];
  form: RateForm;
  isOpen: boolean;
  onInactivate: (id: string) => void;
  onSubmit: () => void;
  rates: RateItem[];
  setForm: (form: RateForm | ((current: RateForm) => RateForm)) => void;
  setIsOpen: (isOpen: boolean) => void;
}>) {
  return (
    <div className="p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-base font-semibold">Tabela de pagamento</h3>
          <p className="mt-1 text-sm text-slate-500">
            Negociacao por profissional, tempo de consulta, valor e periodo de vigencia.
          </p>
        </div>
        <button
          aria-label="Incluir tabela"
          className="flex h-10 w-10 items-center justify-center rounded-md bg-pronus-primary text-xl font-semibold leading-none text-white"
          title="Incluir tabela"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          +
        </button>
      </div>

      {isOpen && (
        <div className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_180px_180px_180px_auto]">
          <SelectField
            label="Profissional"
            value={form.clinician}
            onChange={(value) => setForm((current) => ({ ...current, clinician: value }))}
            options={clinicalPeople.map((person) => ({
              label: person.name,
              value: person.name,
            }))}
          />
          <Field
            label="Tempo consulta"
            type="number"
            value={String(form.appointmentMinutes)}
            onChange={(value) =>
              setForm((current) => ({ ...current, appointmentMinutes: Number(value) }))
            }
          />
          <Field
            label="Valor"
            type="number"
            value={String(form.value)}
            onChange={(value) => setForm((current) => ({ ...current, value: Number(value) }))}
          />
          <Field
            label="Inicio"
            type="date"
            value={form.startDate}
            onChange={(value) => setForm((current) => ({ ...current, startDate: value }))}
          />
          <div className="flex items-end">
            <button
              className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white"
              type="button"
              onClick={onSubmit}
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Profissional</th>
              <th className="px-4 py-3 font-semibold">Tempo</th>
              <th className="px-4 py-3 font-semibold">Valor</th>
              <th className="px-4 py-3 font-semibold">Inicio</th>
              <th className="px-4 py-3 font-semibold">Fim</th>
              <th className="px-4 py-3 font-semibold">Acao</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rates.map((rate) => (
              <tr key={rate.id}>
                <td className="px-4 py-3 font-semibold">{rate.clinician}</td>
                <td className="px-4 py-3">{rate.appointmentMinutes} min</td>
                <td className="px-4 py-3">{money(rate.value)}</td>
                <td className="px-4 py-3">{dateLabel(rate.startDate)}</td>
                <td className="px-4 py-3">
                  {rate.endDate === undefined ? (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      Vigente
                    </span>
                  ) : (
                    dateLabel(rate.endDate)
                  )}
                </td>
                <td className="px-4 py-3">
                  {rate.endDate === undefined ? (
                    <ActionButton onClick={() => onInactivate(rate.id)}>Inativar</ActionButton>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500">Inativa</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KeyIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M15 7a4 4 0 1 0 2 3.46L22 5.5V3h-2.5L17 5.5 15.5 4 14 5.5 15 7Z" />
      <path d="M7 14a4 4 0 0 0 4-4" />
    </svg>
  );
}

function ActionButton({ children, onClick }: Readonly<{ children: string; onClick: () => void }>) {
  return (
    <button
      className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-pronus-primary hover:text-pronus-primary"
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  onChange,
  type = "text",
  value,
}: Readonly<{
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: Readonly<{
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <select
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function calculateSlots(start: string, end: string, appointmentMinutes: number) {
  if (start.length === 0 || end.length === 0 || appointmentMinutes <= 0) {
    return 0;
  }

  const startParts = start.split(":").map(Number);
  const endParts = end.split(":").map(Number);
  const startHour = startParts[0] ?? 0;
  const startMinute = startParts[1] ?? 0;
  const endHour = endParts[0] ?? 0;
  const endMinute = endParts[1] ?? 0;
  const duration = endHour * 60 + endMinute - (startHour * 60 + startMinute);

  if (duration <= 0) {
    return 0;
  }

  return Math.floor(duration / appointmentMinutes);
}

function weekdayLabel(selectedWeekdays: Weekday[]) {
  return weekdays
    .filter((weekday) => selectedWeekdays.includes(weekday.id))
    .map((weekday) => weekday.label)
    .join(", ");
}

function dateLabel(value: string) {
  if (value.length === 0) {
    return "-";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value);
}

function isPersonStatus(value: string): value is PersonStatus {
  return (
    value === "active" || value === "pending" || value === "suspended" || value === "cancelled"
  );
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
