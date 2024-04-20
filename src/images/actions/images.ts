export enum ImgState {
  neutral = '#fff',
  increasing = '#4CCF5E',
  decreasing = '#F03B3C',
}

export function changeSvgState(svg: string, state: ImgState) {
  return svg.replace('#fff', state);
}

export const arrowUp =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170">  <path d="M-.16 149.02V0h149.09v45.63H78.79c30.67 30.68 61.11 61.12 91.37 91.38-11.2 11.2-21.97 21.98-32.98 32.99-30.23-30.24-60.68-60.69-91.43-91.44v70.46H-.16Z" style="fill:#fff;stroke-width:0"/></svg>';
export const arrowDown =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170">  <path d="M170.16 20.98V170H21.07v-45.63h70.14C60.54 93.69 30.1 63.26-.16 32.99 11.04 21.79 21.81 11.01 32.81 0c30.23 30.24 60.68 60.69 91.43 91.44V20.98h45.92Z" style="fill:#fff;stroke-width:0"/></svg>';
