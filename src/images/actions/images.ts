export enum ImgState {
  neutral = '#fff',
  increasing = '#4CCF5E',
  decreasing = '#F03B3C',
}

export function changeSvgState(svg: string, state: ImgState) {
  return svg.replace('#fff', state);
}

export const arrowUp =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170">  <path d="M20.98 0H170v149.09h-45.63V78.79c-30.68 30.67-61.12 61.11-91.38 91.37-11.2-11.2-21.98-21.97-32.99-32.98 30.24-30.23 60.69-60.68 91.44-91.43H20.98V0Z" style="fill:#fff;stroke-width:0"/></svg>';
export const arrowDown =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170">  <path d="M170.16 20.98V170H21.07v-45.63h70.14C60.54 93.69 30.1 63.26-.16 32.99 11.04 21.79 21.81 11.01 32.81 0c30.23 30.24 60.68 60.69 91.43 91.44V20.98h45.92Z" style="fill:#fff;stroke-width:0"/></svg>';
