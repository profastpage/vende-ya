const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\StreamControlPanel.tsx');
let code = fs.readFileSync(file, 'utf8');

if(!code.includes('endStream')) {
  code = code.replace(/import \{ createExpressProduct \} from '@\/app\/studio\/actions'/, `import { createExpressProduct, endStream } from '@/app/studio/actions'`);
}

const targetLogic = `(e.target as HTMLFormElement).reset()
    }
  }`;

const newLogic = `(e.target as HTMLFormElement).reset()
    }
  }

  const handleEndStream = async () => {
    if(!confirm('¿Seguro que deseas finalizar el en vivo? Ya no aparecerás en la página principal.')) return;
    setLoading(true);
    const res = await endStream(stream.id);
    if(res.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success('Transmisión finalizada correctamente');
      window.location.href = '/mi-dashboard';
    }
  }`;

code = code.replace(targetLogic, newLogic);

const btnTarget = `<button className="w-full bg-rose-500/20 text-rose-400 font-bold py-3 rounded-xl hover:bg-rose-500/30 transition-colors text-sm">
            Finalizar En Vivo
          </button>`;
const btnReplacement = `<button onClick={handleEndStream} disabled={loading} className="w-full bg-rose-500/20 text-rose-400 font-bold py-3 rounded-xl hover:bg-rose-500/30 transition-colors text-sm disabled:opacity-50">
            {loading ? 'Finalizando...' : 'Finalizar En Vivo'}
          </button>`;

code = code.replace(btnTarget, btnReplacement);

fs.writeFileSync(file, code, 'utf8');