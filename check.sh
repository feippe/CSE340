echo "== Rutas ==" && \
grep -nE 'router\.get\("/detail/:inv_id' routes/inventoryRoute.js || echo "❌ Falta /inv/detail/:inv_id" ; \
grep -nE 'router\.get\("/type/:classificationId' routes/inventoryRoute.js || echo "⚠️ Revisa /inv/type/:classificationId" ; \
echo "== Controlador ==" && \
grep -nE 'buildByInventoryId' controllers/*.js || echo "❌ Falta buildByInventoryId" ; \
grep -nE 'res\.render\("inventory/detail' controllers/*.js || echo "❌ render de detalle no apunta a inventory/detail" ; \
echo "== Modelo ==" && \
grep -nE 'getVehicleById' models/inventory-model.js || echo "❌ Falta getVehicleById" ; \
grep -nE 'WHERE inv_id = \$1' models/inventory-model.js || echo "❌ Falta prepared statement \$1" ; \
echo "== Utilities ==" && \
grep -nE 'buildVehicleDetail' utilities/index.js || echo "❌ Falta buildVehicleDetail" ; \
grep -nE 'Util\.usd|utilities\.usd' utilities/index.js || echo "❌ Falta formateador USD" ; \
grep -nE 'toLocaleString\\(.' utilities/index.js || echo "⚠️ Revisa formateo millas" ; \
echo "== Vista ==" && \
test -f views/inventory/detail.ejs && echo "✓ views/inventory/detail.ejs" || echo "❌ Falta views/inventory/detail.ejs" ; \
grep -n '<%- detailHTML %>' views/inventory/detail.ejs || echo "❌ La vista debe insertar <%- detailHTML %>" ; \
grep -n '<h1><%= title %></h1>' views/inventory/detail.ejs || echo "⚠️ H1 puede no coincidir con title" ; \
echo "== Layout y server ==" && \
grep -n 'app.set("layout", "layouts/layout")' server.js || echo "⚠️ Revisa app.set(layout)" ; \
grep -n 'app.get\("/cause-500"' server.js || echo "❌ Falta /cause-500" ; \
grep -n 'next\\({ status: 404' server.js || echo "❌ Falta catch-all 404" ; \
grep -n 'res.status(status).render' server.js || echo "❌ Handler global debe usar res.status(status)" ; \
echo "== CSS responsive (heurístico) ==" && \
grep -Rni '@media (min-width: 900px)' public 2>/dev/null || echo "⚠️ No encuentro media query 900px (puede estar con otro valor/archivo)" ; \
echo "== Pruebas HTTP == (arranca app en otra terminal con: npm start)" && \
echo 'curl -si http://localhost:3000/inv/detail/1 | head -n 1' && \
echo 'curl -si http://localhost:3000/no-existe   | head -n 1' && \
echo 'curl -si http://localhost:3000/cause-500  | head -n 1'
