export type VehicleType = 'CARRO' | 'MOTO' | 'ONIBUS' | 'CAMINHAO' | 'OUTRO';

export const VEHICLE_TYPE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: 'CARRO', label: 'Carro' },
  { value: 'MOTO', label: 'Moto' },
  { value: 'ONIBUS', label: 'Ônibus' },
  { value: 'CAMINHAO', label: 'Caminhão' },
  { value: 'OUTRO', label: 'Outro' },
];

export function vehicleTypeLabel(tipo: VehicleType): string {
  return VEHICLE_TYPE_OPTIONS.find((o) => o.value === tipo)?.label ?? tipo;
}
