"use client";

import { useMemo, useState } from "react";
import {
  structuralAudienceLabels,
  type StructuralAudience,
  type StructuralJobPosition,
} from "../pronus-data";

type CollaboratorsTab = "rh" | "pronus" | "permissions" | "schedule";

type PersonStatus = "active" | "pending" | "blocked";

type Person = {
  id: string;
  name: string;
  email: string;
  company?: string;
  department: string;
  jobPosition: string;
  audience: StructuralAudience;
  status: PersonStatus;
};

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

type ScheduleItem = {
  id: string;
  clinician: string;
  specialty: string;
  date: string;
  start: string;
  end: string;
  capacity: number;
  status: "available" | "full" | "blocked";
};

type ScheduleForm = Omit<ScheduleItem, "id" | "status">;

const tabs: Array<{ id: CollaboratorsTab; label: string }> = [
  { id: "rh", label: "RH clientes" },
  { id: "pronus", label: "Colaboradores PRONUS" },
  { id: "permissions", label: "Permissoes do sistema" },
  { id: "schedule", label: "Agenda" },
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
  blocked: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const statusLabels: Record<PersonStatus, string> = {
  active: "Ativo",
  pending: "Validacao",
  blocked: "Bloqueado",
};

const rhPeople: Person[] = [
  {
    id: "rh-industria-mariana",
    name: "Mariana Costa",
    email: "rh@industriahorizonte.com.br",
    company: "Industria Horizonte",
    department: "Recursos Humanos",
    jobPosition: "RH cliente",
    audience: "client_hr",
    status: "active",
  },
  {
    id: "rh-rede-paulo",
    name: "Paulo Mendes",
    email: "rh@redenorte.com.br",
    company: "Rede Norte",
    department: "Recursos Humanos",
    jobPosition: "Gestor cliente",
    audience: "client_manager",
    status: "pending",
  },
];

const pronusPeople: Person[] = [
  {
    id: "pronus-ana-admin",
    name: "Ana Paula Martins",
    email: "ana.martins@pronus.com.br",
    department: "Administrativo PRONUS",
    jobPosition: "Analista Administrativo PRONUS",
    audience: "pronus_administrative",
    status: "active",
  },
  {
    id: "pronus-dr-carlos",
    name: "Carlos Henrique Nunes",
    email: "carlos.nunes@pronus.com.br",
    department: "Corpo Clinico PRONUS",
    jobPosition: "Medico do Trabalho",
    audience: "pronus_clinical",
    status: "active",
  },
  {
    id: "pronus-psi-larissa",
    name: "Larissa Moreira",
    email: "larissa.moreira@pronus.com.br",
    department: "Corpo Clinico PRONUS",
    jobPosition: "Psicologa Ocupacional",
    audience: "pronus_clinical",
    status: "active",
  },
];

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
    date: "2026-05-04",
    start: "08:00",
    end: "12:00",
    capacity: 12,
    status: "available",
  },
  {
    id: "schedule-002",
    clinician: "Larissa Moreira",
    specialty: "Psicologia",
    date: "2026-05-04",
    start: "13:00",
    end: "17:00",
    capacity: 8,
    status: "available",
  },
];

const emptyScheduleForm: ScheduleForm = {
  capacity: 8,
  clinician: "Carlos Henrique Nunes",
  date: "",
  end: "",
  specialty: "Medicina ocupacional",
  start: "",
};

export function CollaboratorsWorkforcePanel({
  jobPositions,
}: Readonly<{ jobPositions: StructuralJobPosition[] }>) {
  const [activeTab, setActiveTab] = useState<CollaboratorsTab>("rh");
  const [permissions, setPermissions] = useState(initialPermissions);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>(emptyScheduleForm);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const clinicalPeople = pronusPeople.filter((person) => person.audience === "pronus_clinical");
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
      [field]: field === "capacity" ? Number(value) : value,
    }));
  }

  function submitSchedule() {
    if (
      scheduleForm.clinician.length === 0 ||
      scheduleForm.date.length === 0 ||
      scheduleForm.start.length === 0 ||
      scheduleForm.end.length === 0
    ) {
      setMessage("Preencha profissional, data, inicio e fim para criar agenda.");
      return;
    }

    setSchedule((current) => [
      {
        ...scheduleForm,
        id: `schedule-${current.length + 1}-${scheduleForm.date}`,
        status: "available",
      },
      ...current,
    ]);
    setIsScheduleOpen(false);
    setScheduleForm(emptyScheduleForm);
    setMessage("Agenda cadastrada para o corpo clinico PRONUS.");
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

      {activeTab === "rh" && <PeopleTable people={rhPeople} title="Clientes RH" />}
      {activeTab === "pronus" && (
        <PeopleTable people={pronusPeople} title="Colaboradores internos PRONUS" />
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
          clinicalPeople={clinicalPeople}
          form={scheduleForm}
          isOpen={isScheduleOpen}
          schedule={schedule}
          setIsOpen={setIsScheduleOpen}
          updateForm={updateScheduleForm}
          onSubmit={submitSchedule}
        />
      )}
    </section>
  );
}

function PeopleTable({ people, title }: Readonly<{ people: Person[]; title: string }>) {
  return (
    <div className="p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            Lista operacional de pessoas com acesso ao ecossistema PRONUS.
          </p>
        </div>
        <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
          {people.length} registros
        </span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Nome</th>
              <th className="px-4 py-3 font-semibold">Perfil</th>
              <th className="px-4 py-3 font-semibold">Vinculo</th>
              <th className="px-4 py-3 font-semibold">Cargo</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {people.map((person) => (
              <tr key={person.id}>
                <td className="px-4 py-3">
                  <strong className="block font-semibold">{person.name}</strong>
                  <span className="mt-1 block text-xs text-slate-500">{person.email}</span>
                </td>
                <td className="px-4 py-3">{structuralAudienceLabels[person.audience]}</td>
                <td className="px-4 py-3">{person.company ?? "PRONUS"}</td>
                <td className="px-4 py-3">{person.jobPosition}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[person.status]}`}
                  >
                    {statusLabels[person.status]}
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
  clinicalPeople,
  form,
  isOpen,
  schedule,
  setIsOpen,
  updateForm,
  onSubmit,
}: Readonly<{
  clinicalPeople: Person[];
  form: ScheduleForm;
  isOpen: boolean;
  schedule: ScheduleItem[];
  setIsOpen: (isOpen: boolean) => void;
  updateForm: (field: keyof ScheduleForm, value: string) => void;
  onSubmit: () => void;
}>) {
  return (
    <div className="p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-base font-semibold">Agenda do corpo clinico</h3>
          <p className="mt-1 text-sm text-slate-500">
            Cadastre disponibilidade para atendimentos dos clientes das empresas contratantes.
          </p>
        </div>
        <button
          className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "Fechar agenda" : "Nova agenda"}
        </button>
      </div>

      {isOpen && (
        <div className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
          <SelectField
            label="Profissional"
            value={form.clinician}
            onChange={(value) => updateForm("clinician", value)}
            options={clinicalPeople.map((person) => ({ label: person.name, value: person.name }))}
          />
          <Field
            label="Especialidade"
            value={form.specialty}
            onChange={(value) => updateForm("specialty", value)}
          />
          <Field
            label="Data"
            type="date"
            value={form.date}
            onChange={(value) => updateForm("date", value)}
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
            label="Vagas"
            type="number"
            value={String(form.capacity)}
            onChange={(value) => updateForm("capacity", value)}
          />
          <div className="md:col-span-3">
            <button
              className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white"
              type="button"
              onClick={onSubmit}
            >
              Salvar agenda
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Profissional</th>
              <th className="px-4 py-3 font-semibold">Especialidade</th>
              <th className="px-4 py-3 font-semibold">Data</th>
              <th className="px-4 py-3 font-semibold">Horario</th>
              <th className="px-4 py-3 font-semibold">Vagas</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {schedule.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-semibold">{item.clinician}</td>
                <td className="px-4 py-3">{item.specialty}</td>
                <td className="px-4 py-3">{dateLabel(item.date)}</td>
                <td className="px-4 py-3">
                  {item.start} - {item.end}
                </td>
                <td className="px-4 py-3">{item.capacity}</td>
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
    </div>
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
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
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
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
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

function dateLabel(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}
