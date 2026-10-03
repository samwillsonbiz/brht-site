import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const target = path.join(root, 'components/fableFury/FableFurySoloRunV2.tsx');
const components = fs.readFileSync(path.join(root, 'scripts/fable-portal-components.txt'), 'utf8');
const functions = fs.readFileSync(path.join(root, 'scripts/fable-portal-functions.txt'), 'utf8');
let text = fs.readFileSync(target, 'utf8');

if (text.includes('function PortalControls(') && text.includes('const [shopOpen, setShopOpen]')) {
  console.log('Fable Fury portal/shop patch already applied.');
  process.exit(0);
}

function replaceOnce(needle, replacement, label) {
  if (!text.includes(needle)) throw new Error(`Fable portal patch failed: missing ${label}`);
  text = text.replace(needle, replacement);
}

replaceOnce(
  '  const [shrineStarted, setShrineStarted] = useState<string[]>([]);\n',
  '  const [shrineStarted, setShrineStarted] = useState<string[]>([]);\n  const [shopOpen, setShopOpen] = useState(false);\n',
  'shop state anchor',
);

replaceOnce(
  '  const inventoryLocked = lootInbox.length > 0;\n',
  '  const inventoryLocked = lootInbox.length > 0;\n  const portalCanLeave = resolvedKeys.some((key) => key.startsWith(`${realm}:`) && cardsByCell[key]?.subtype === "shrine");\n',
  'portal availability anchor',
);

replaceOnce('\nexport default function FableFurySoloRunV2() {', `${components}\nexport default function FableFurySoloRunV2() {`, 'component insertion anchor');
replaceOnce('  async function revealLocation(cell: string) {\n', `${functions}  async function revealLocation(cell: string) {\n`, 'logic insertion anchor');

replaceOnce(
  ': selectedCard.card_type === "special" && selectedCard.subtype === "shrine" ?',
  ': selectedCard.id === "special-portal" ? <PortalControls canLeave={portalCanLeave} onStay={() => { setSelectedCard(null); setSelectedCell(null); }} onLeave={leaveThroughPortal} /> : selectedCard.card_type === "special" && selectedCard.subtype === "shrine" ?',
  'portal modal branch',
);

replaceOnce(
  'setSelectedCard(null); setEventState(null); }',
  'setSelectedCard(null); setEventState(null); setShopOpen(false); }',
  'reset run anchor',
);

replaceOnce(
  '    {reactionRoll && <ModalShell z="z-[500]">',
  '    {shopOpen && <ShopModal realm={realm} coins={coins} armor={armor} maxArmor={effectiveMaxArmor} attackDice={attackDice} maxAttackDice={effectiveMaxDice} backpack={backpack} coinSlots={coinSlots} lootInbox={lootInbox} onBuyToken={buyShopToken} onBuyLoot={buyShopLoot} onBuyAttackDice={buyShopAttackDie} onBuyArmor={buyShopArmor} onSellLoot={sellShopLoot} onPackLoot={packLoot} onDiscardLoot={discardInbox} onFinish={finishShopping} />}\n\n    {reactionRoll && <ModalShell z="z-[500]">',
  'shop modal anchor',
);

fs.writeFileSync(target, text);
console.log('Applied Fable Fury Portal + Gift Shop patch.');
