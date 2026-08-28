const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vendedores\\[username]\\SellerProfileClient.tsx');
let code = fs.readFileSync(file, 'utf8');

const target = `</div>
          </motion.div>
  
          {/* Tabs */}`;

const replacement = `</div>
          </motion.div>

          {activeStream && (
            <div className="mt-6 mb-2">
              <Link href={\`/en-vivo/\${seller.username}\`} className="block">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 to-fuchsia-600 p-1 flex items-center justify-between group shadow-2xl shadow-rose-500/20 animate-pulse transition-all hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                  <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 flex items-center justify-between w-full relative z-10 border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-rose-500 flex items-center justify-center animate-bounce shadow-lg shadow-rose-500/50">
                        <Radio className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-black text-lg md:text-xl flex items-center gap-2">
                          ¡Estoy transmitiendo EN VIVO!
                        </h3>
                        <p className="text-rose-200 text-xs md:text-sm font-medium">{activeStream.title}</p>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 bg-white text-rose-600 px-4 py-2 rounded-full font-bold text-sm shadow-xl group-hover:bg-rose-50 transition-colors">
                      Entrar a la Sala <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}
  
          {/* Tabs */}`;

if(code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(file, code, 'utf8');
} else {
  console.log("NOT FOUND");
}