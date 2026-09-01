export type UserRole = 'ADMIN' | 'MOTORISTA';

export type VehicleType = 'CARRO' | 'MOTO' | 'ONIBUS' | 'CAMINHAO' | 'OUTRO';

export interface User {
  id: string;
  nome: string;
  cpf_mascarado: string;
  email: string;
  role: UserRole;
  senha_provisoria?: boolean;
  criado_em: string;
}

export interface Vehicle {
  id: string;
  placa: string;
  modelo: string;
  cor: string;
  tipo: VehicleType;
  owner_id: string;
  owner?: User;
  criado_em: string;
  excluido_em?: string | null;
}

export interface VehicleAutocomplete {
  id: string;
  placa: string;
  modelo: string;
}

export interface ParkingRecord {
  id: string;
  vehicle_id: string;
  data_entrada: string;
  data_saida: string | null;
  registrado_por: string;
  status: 'NO_PATIO' | 'FINALIZADO';
  vehicle?: Vehicle;
}

export interface Dashboard {
  ocupadas: number;
  capacidade_maxima: number;
  vagas_disponiveis: number;
  lotado: boolean;
  veiculos_no_patio: ParkingRecord[];
}

export interface ParkingConfig {
  id: string;
  capacidade_maxima: number;
  atualizado_em: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface MessageResponse {
  message: string;
}
