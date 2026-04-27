import { FONTS_URL, CYAN } from '../utils/theme'

export default function ThemeStyles({ includeAnimations = true }) {
  return (
    <style>{`
      @import url('${FONTS_URL}');

      * { box-sizing: border-box; }

      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-thumb { background: rgba(0,210,200,0.3); }

      input::placeholder, textarea::placeholder {
        color: rgba(255,255,255,0.2) !important;
      }

      textarea { resize: none; }

      ${includeAnimations ? `
        @keyframes pulse    { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes blink    { 0%,100% { opacity:1 } 50% { opacity:0 } }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
        @keyframes fadeSlide { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
        .fu { animation: fadeUp 0.4s ease forwards; }
        .fs { animation: fadeSlide 0.4s ease forwards; }
        .thinking::after {
          content: "●●●";
          animation: blink 1.2s ease-in-out infinite;
          letter-spacing: 3px;
          color: ${CYAN};
        }
      ` : ''}
    `}</style>
  )
}