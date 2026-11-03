import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EventoDto } from './evento.dto.js';

const sobre = (cambios: object = {}) => plainToInstance(EventoDto, {
  eventoId: '0f8c2a4e-1111-4222-8333-444455556666',
  tipo: 'prestamo.creado', version: 1, emitidoEn: '2026-11-02T12:00:00.000Z',
  libroId: '7', usuarioSub: 'lector-1',
  datos: { prestamoId: '12', desde: '2026-11-02', hasta: '2026-11-16' }, ...cambios,
});
const errores = (cambios: object = {}) => validateSync(sobre(cambios), {
  whitelist: true, forbidNonWhitelisted: true,
});

describe('contrato que consume biblioteca-panel', () => {
  it.each([
    ['prestamo.creado', { prestamoId: '12', desde: '2026-11-02', hasta: '2026-11-16' }],
    ['prestamo.devuelto', { prestamoId: '12' }],
    ['lectura.iniciada', { sesionId: 's1', dispositivo: 'tablet' }],
    ['lectura.terminada', { sesionId: 's1', paginasLeidas: 0, duracionSeg: 60, resultado: 'error' }],
    ['capitulo.terminado', { sesionId: 's1', capitulo: 1 }],
  ])('acepta el tipo %s y sus datos', (tipo, datos) => {
    expect(errores({ tipo, datos })).toHaveLength(0);
  });

  it.each([
    { version: 99 }, { eventoId: 'no-uuid' }, { libroId: 7 },
    { tipo: 'otra.cosa' }, { datos: undefined }, { datos: null },
    { tipo: 'capitulo.terminado', datos: { sesionId: 's1', capitulo: 0 } },
    { tipo: 'lectura.terminada', datos: { sesionId: 's1', paginasLeidas: -1, duracionSeg: 1, resultado: 'completada' } },
    { datos: { prestamoId: '12', desde: '2026-02-30', hasta: '2026-11-16' } },
    { campoExtra: true },
  ])('rechaza un sobre invalido: %j', cambios => {
    expect(errores(cambios)).not.toHaveLength(0);
  });
});
