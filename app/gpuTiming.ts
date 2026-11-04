/** Nonblocking, sampled WebGL2 timer queries. Unavailable/disjoint samples are never reported as zero. */
export class GpuTiming {
  private extension: {
    TIME_ELAPSED_EXT: number;
    GPU_DISJOINT_EXT: number;
  } | null;
  private pending: WebGLQuery | null = null;
  private active = false;
  milliseconds: number | null = null;
  private gl: WebGL2RenderingContext;
  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.extension = gl.getExtension('EXT_disjoint_timer_query_webgl2');
  }
  poll() {
    if (!this.extension) return;
    if (this.gl.isContextLost()) {
      this.dispose();
      this.milliseconds = null;
      return;
    }
    if (this.gl.getParameter(this.extension.GPU_DISJOINT_EXT)) {
      this.milliseconds = null;
      if (this.pending && !this.active) {
        this.gl.deleteQuery(this.pending);
        this.pending = null;
      }
      return;
    }
    if (
      this.pending &&
      !this.active &&
      this.gl.getQueryParameter(this.pending, this.gl.QUERY_RESULT_AVAILABLE)
    ) {
      const nanoseconds = this.gl.getQueryParameter(
        this.pending,
        this.gl.QUERY_RESULT,
      );
      this.milliseconds =
        Number.isFinite(nanoseconds) && nanoseconds >= 0
          ? nanoseconds / 1e6
          : null;
      this.gl.deleteQuery(this.pending);
      this.pending = null;
    }
  }
  begin() {
    this.poll();
    if (
      !this.extension ||
      this.pending ||
      this.gl.isContextLost() ||
      this.gl.getParameter(this.extension.GPU_DISJOINT_EXT)
    )
      return false;
    this.pending = this.gl.createQuery();
    if (!this.pending) return false;
    this.gl.beginQuery(this.extension.TIME_ELAPSED_EXT, this.pending);
    this.active = true;
    return true;
  }
  end() {
    if (this.active && this.extension) {
      this.gl.endQuery(this.extension.TIME_ELAPSED_EXT);
      this.active = false;
    }
  }
  dispose() {
    this.end();
    if (this.pending) {
      this.gl.deleteQuery(this.pending);
      this.pending = null;
    }
  }
}
