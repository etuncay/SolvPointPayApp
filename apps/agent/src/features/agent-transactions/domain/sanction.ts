/** Mock sanction — isimde "sanction" geçerse hit. */
export function screenSanction(name: string): boolean {
  return name.toLowerCase().includes('sanction');
}
