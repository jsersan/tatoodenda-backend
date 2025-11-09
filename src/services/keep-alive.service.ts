// src/services/keep-alive.service.ts
/**
 * Servicio de Keep-Alive para prevenir hibernación en Render
 * Hace ping automático cada 10 minutos para mantener el servidor activo
 */

class KeepAliveService {
  private intervalId: NodeJS.Timeout | null = null;
  private isActive: boolean = false;
  private pingCount: number = 0;
  private lastPingTime: Date | null = null;
  private failedPings: number = 0;
  
  // Intervalo de ping: 10 minutos (Render hiberna después de 15 minutos)
  private readonly PING_INTERVAL = 10 * 60 * 1000; // 10 minutos en ms
  private readonly MAX_FAILED_PINGS = 3;

  /**
   * Inicia el servicio de keep-alive
   */
  start(): void {
    if (this.isActive) {
      console.log('⚠️ Keep-alive ya está activo');
      return;
    }

    // Solo activar en producción (Render)
    if (process.env.NODE_ENV !== 'production') {
      console.log('ℹ️ Keep-alive desactivado en desarrollo');
      return;
    }

    console.log('🚀 Iniciando servicio Keep-Alive...');
    console.log(`   Intervalo: ${this.PING_INTERVAL / 60000} minutos`);
    
    this.isActive = true;
    
    // Hacer primer ping inmediatamente
    this.performPing();
    
    // Configurar pings periódicos
    this.intervalId = setInterval(() => {
      this.performPing();
    }, this.PING_INTERVAL);

    console.log('✅ Keep-Alive activado correctamente');
  }

  /**
   * Detiene el servicio de keep-alive
   */
  stop(): void {
    if (!this.isActive) {
      console.log('⚠️ Keep-alive ya está inactivo');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isActive = false;
    console.log('🛑 Keep-Alive detenido');
    this.logStats();
  }

  /**
   * Realiza un ping al servidor para mantenerlo activo
   */
  private async performPing(): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Hacer request al propio servidor
      const baseUrl = process.env.BASE_URL || 
                     `http://localhost:${process.env.PORT || 3000}`;
      
      console.log(`🔄 [Keep-Alive] Ping #${this.pingCount + 1} a ${baseUrl}/health`);
      
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'X-Keep-Alive': 'true',
          'User-Agent': 'TatooDenda-KeepAlive/1.0'
        },
        // Timeout de 10 segundos
        signal: AbortSignal.timeout(10000)
      });

      const duration = Date.now() - startTime;
      this.lastPingTime = new Date();
      this.pingCount++;
      this.failedPings = 0; // Reset contador de fallos

      if (response.ok) {
        console.log(`✅ [Keep-Alive] Ping exitoso (${duration}ms)`);
        
        // Opcional: parsear respuesta para verificar estado
        try {
          const data = await response.json();
          // console.log(`   Status: ${data.status}, Uptime: ${Math.floor(data.uptime)}s`);
        } catch (parseError) {
          // Ignorar errores de parseo
        }
      } else {
        console.warn(`⚠️ [Keep-Alive] Ping con error HTTP ${response.status}`);
        this.handleFailedPing();
      }
      
    } catch (error) {
      console.error('❌ [Keep-Alive] Error en ping:', error);
      this.handleFailedPing();
    }
  }

  /**
   * Maneja pings fallidos
   */
  private handleFailedPing(): void {
    this.failedPings++;
    
    if (this.failedPings >= this.MAX_FAILED_PINGS) {
      console.error(`🚨 [Keep-Alive] ${this.failedPings} pings consecutivos fallidos`);
      console.error('   El servidor puede estar teniendo problemas');
      
      // Opcional: enviar alerta (implementar según necesidad)
      this.sendAlert();
    }
  }

  /**
   * Envía alerta cuando hay múltiples fallos
   * IMPLEMENTAR según necesidades (email, webhook, etc.)
   */
  private sendAlert(): void {
    // TODO: Implementar sistema de alertas
    console.warn('⚠️ [Keep-Alive] Alerta: Múltiples pings fallidos');
  }

  /**
   * Obtiene estadísticas del servicio
   */
  getStats(): KeepAliveStats {
    return {
      isActive: this.isActive,
      totalPings: this.pingCount,
      lastPingTime: this.lastPingTime,
      failedPings: this.failedPings,
      intervalMinutes: this.PING_INTERVAL / 60000
    };
  }

  /**
   * Muestra estadísticas en consola
   */
  logStats(): void {
    const stats = this.getStats();
    console.log('\n📊 === Keep-Alive Statistics ===');
    console.log(`   Estado: ${stats.isActive ? '🟢 Activo' : '🔴 Inactivo'}`);
    console.log(`   Total pings: ${stats.totalPings}`);
    console.log(`   Último ping: ${stats.lastPingTime?.toLocaleString() || 'Nunca'}`);
    console.log(`   Pings fallidos: ${stats.failedPings}`);
    console.log(`   Intervalo: ${stats.intervalMinutes} minutos`);
    console.log('================================\n');
  }

  /**
   * Verifica si el servicio está activo
   */
  isRunning(): boolean {
    return this.isActive;
  }
}

// Interfaces
interface KeepAliveStats {
  isActive: boolean;
  totalPings: number;
  lastPingTime: Date | null;
  failedPings: number;
  intervalMinutes: number;
}

// Exportar instancia singleton
export const keepAliveService = new KeepAliveService();

// También exportar la clase por si se necesita crear múltiples instancias
export default KeepAliveService;