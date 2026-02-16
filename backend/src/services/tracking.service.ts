import { env } from '../config/env.js';

export interface TrackingEvent {
  date: string;
  time: string;
  location: string;
  status: string;
  description: string;
}

export interface TrackingResponse {
  code: string;
  events: TrackingEvent[];
  isDelivered: boolean;
  lastUpdate: string | null;
}

interface CacheEntry {
  data: TrackingResponse;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; 

function getFromCache(code: string): TrackingResponse | null {
  const entry = cache.get(code);
  
  if (!entry) {
    return null;
  }

  const now = Date.now();
  const age = now - entry.timestamp;

  if (age > CACHE_TTL_MS) {
    cache.delete(code);
    console.log(`[Cache] EXPIRED: ${code} (age: ${Math.round(age / 1000)}s)`);
    return null;
  }

  console.log(`[Cache] HIT: ${code} (age: ${Math.round(age / 1000)}s)`);
  return entry.data;
}

function saveToCache(code: string, data: TrackingResponse): void {
  cache.set(code, {
    data,
    timestamp: Date.now(),
  });
  console.log(`[Cache] SAVED: ${code}`);
}

setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      cache.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`[Cache] Cleanup: removed ${cleaned} expired entries`);
  }
}, 5 * 60 * 1000);

interface RapidApiEndereco {
  cidade?: string;
  uf?: string;
}

interface RapidApiUnidade {
  nome?: string;
  tipo?: string;
  endereco?: RapidApiEndereco;
}

interface RapidApiDateTime {
  date: string;
  timezone_type: number;
  timezone: string;
}

interface RapidApiEvento {
  codigo: string;
  tipo: string;
  dtHrCriado: RapidApiDateTime;
  descricao: string;
  descricaoFrontEnd?: string;
  unidade?: RapidApiUnidade;
  unidadeDestino?: RapidApiUnidade;
  finalizador?: string;
}

interface RapidApiResponse {
  codObjeto: string;
  tipoPostal?: {
    sigla: string;
    descricao: string;
    categoria: string;
  };
  dtPrevista?: string;
  eventos?: RapidApiEvento[];
  situacao?: string;
  error?: string;
  message?: string;
}

const RAPIDAPI_HOST = 'correios-rastreamento-de-encomendas.p.rapidapi.com';

export async function trackPackage(trackingCode: string): Promise<TrackingResponse> {
  const code = trackingCode.toUpperCase().trim();
  
  console.log(`[RapidAPI] Tracking: ${code}`);

  const cached = getFromCache(code);
  if (cached) {
    return cached;
  }

  console.log(`[Cache] MISS: ${code} - fetching from API...`);
  
  try {
    const url = `https://${RAPIDAPI_HOST}/correios?tracking_code=${code}&confidence_level=high`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': env.RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      console.error(`[RapidAPI] HTTP Error: ${response.status}`);
      return emptyResponse(code);
    }

    const data = (await response.json()) as RapidApiResponse;

    if (data.error || data.message) {
      console.error(`[RapidAPI] Error: ${data.error || data.message}`);
      return emptyResponse(code);
    }

    if (!data.eventos || data.eventos.length === 0) {
      console.log('[RapidAPI] No events found');
      return emptyResponse(code);
    }

    const events: TrackingEvent[] = data.eventos.map((evento) => {
      const dateTime = new Date(evento.dtHrCriado.date.replace(' ', 'T'));
      
      let location = '';
      if (evento.unidade?.endereco) {
        const { cidade, uf } = evento.unidade.endereco;
        location = [cidade, uf].filter(Boolean).join('/');
      }

      let description = '';
      if (evento.unidadeDestino?.endereco) {
        const { cidade, uf } = evento.unidadeDestino.endereco;
        if (cidade || uf) {
          description = `Destino: ${[cidade, uf].filter(Boolean).join('/')}`;
        }
      }

      return {
        date: dateTime.toLocaleDateString('en-US'),
        time: dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        location,
        status: evento.descricaoFrontEnd || evento.descricao,
        description,
      };
    });

    const isDelivered = 
      data.situacao === 'E' ||
      events.some((e) =>
        e.status.toLowerCase().includes('entregue') ||
        e.status.toLowerCase().includes('delivered')
      );

    const result: TrackingResponse = {
      code: data.codObjeto || code,
      events,
      isDelivered,
      lastUpdate: events[0]?.date || null,
    };

    saveToCache(code, result);

    console.log(`[RapidAPI] Success: ${events.length} events | Situation: ${data.situacao} | Delivered: ${isDelivered}`);

    return result;

  } catch (error) {
    console.error('[RapidAPI] Error:', error);
    return emptyResponse(code);
  }
};

function emptyResponse(code: string): TrackingResponse {
  return {
    code,
    events: [],
    isDelivered: false,
    lastUpdate: null,
  };
}

export function getCacheStats() {
  return {
    size: cache.size,
    entries: Array.from(cache.keys()),
  };
}