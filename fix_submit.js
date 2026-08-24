const fs = require('fs');
const path = require('path');
const pagePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(pagePath, 'utf8');

const regex = /const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?\}\*\/\n  \}/;

const newHandleSubmit = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !price || (isLive && !kickUsername)) {
      toast({ title: 'Error', description: 'Todos los campos son obligatorios, y si es en vivo, tu usuario de Kick.', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      if (isLive) {
        await createKickStream(title, kickUsername, isAuction, Number(price))
        toast({ title: '¡En Vivo!', description: 'Tu transmisión de Kick ha sido enlazada a Vende Ya exitosamente.' })
        router.push('/')
      } else {
        // Marketplace mock creation
        await new Promise((r) => setTimeout(r, 1000))
        toast({ title: '📦 Producto publicado', description: 'Tu producto ya está en el marketplace.' })
        router.push(ROUTES.dashboard)
      }
    } catch(err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }`;

text = text.replace(regex, newHandleSubmit);
fs.writeFileSync(pagePath, text, 'utf8');
console.log('Fixed handleSubmit');