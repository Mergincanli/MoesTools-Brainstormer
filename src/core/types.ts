// The shapes of the data the generator reads and of the card draft it builds.
//
// All data comes in as one plain object (GeneratorData), built outside this module by scripts/lib/generator-data.mjs
// from the word lists (data/vocab), the patterns (data/patterns), the pattern registry, the generator files
// (data/generator) and the real names the name check needs. Nothing here reads files: the module runs unchanged in a
// browser. Field names follow the JSON files and the schemas in schemas/, so a type here can be checked against them.

/** A typed link: kind:id, kind:<=id or kind:>=id (docs/fields.md, Conventions). */
export type Link = string

/** A term of a word list (schemas/vocabulary.schema.json); only the fields the generator reads are typed. */
export interface Term {
  id: string
  label: string
  description?: string
  rarity?: string
  source_only?: boolean
  rank?: number
  classes?: string[]
  class_rarity?: Record<string, string>
  allowed?: Record<string, string[]>
  excluded?: Record<string, string[]>
  requires?: Link[][]
  min_tier?: string
  uses_key?: boolean
  pattern?: string
  default_damage?: string
  default_aim?: string
  default_delivery?: string
  default_range?: string
  default_handling?: string
  target_type?: string
  strong_vs?: Link[]
  weak_vs?: Link[]
  immune?: Link[]
  seats?: string[]
  max_players?: number
  max_keys?: number
  max_passive?: number
  max_keys_per_seat?: number
  favoured?: Record<string, string[]>
  avoided?: Record<string, string[]>
  favoured_weight?: number
  avoided_until_spice?: number
  name_style?: string
  min_spice?: number
  weights?: number[]
  severity?: 'block' | 'warn'
}

export interface WordList {
  id: string
  version: string
  terms: Term[]
}

/** A link with its reason (common.schema.json relation). */
export interface Relation {
  ref: Link
  why: string
}

/** A pattern's generator block (schemas/pattern.schema.json, generator). */
export interface GeneratorBlock {
  classes: string[]
  class_rarity?: Record<string, string>
  min_tier: string
  kinds: string[]
  slot: 'signature' | 'extra' | 'any'
  rarity: string
  flavour_lean?: string[]
  requires?: Link[][]
  excludes?: Link[]
  implies?: Link[]
  conflicts_with?: string[]
  adds_strengths?: Relation[]
  adds_weaknesses?: Relation[]
  counters?: Relation[]
  countered_by: Relation[]
  points?: { cost: number; power: number; complexity: number }
}

/** The generator fields a variant may replace (schemas/pattern.schema.json, variants[].overrides). */
export interface VariantOverrides {
  classes?: string[]
  class_rarity?: Record<string, string>
  min_tier?: string
  kinds?: string[]
  requires?: Link[][]
  excludes?: Link[]
  implies?: Link[]
  adds_strengths?: Relation[]
  adds_weaknesses?: Relation[]
  counters?: Relation[]
  countered_by?: Relation[]
}

export interface Variant {
  id: string
  name: string
  summary: string
  min_spice: number
  seen_in?: string
  overrides?: VariantOverrides
}

/** A mechanic pattern (data/patterns/<id>.json). The text fields the card templates read are typed in a later step. */
export interface Pattern {
  id: string
  status: string
  name: string
  category: string
  also_in?: string[]
  variants: Variant[]
  generator?: GeneratorBlock
  [field: string]: unknown
}

/** An entry of data/pattern-registry.json: every pattern id, written or planned. */
export interface RegistryEntry {
  id: string
  name: string
  category: string
  summary: string
}

/** A link kind of common.schema.json x-ref-kinds: the word list it names and whether it takes <= and >=. */
export interface RefKind {
  vocab: string | null
  means: string
  ranked?: boolean
}

// ---------------------------------------------------------------- data/generator/rules.json

export type Weights = number[]
export type BandWeights = Record<string, number>

export interface RuleDefaults {
  spice: number
  input_odds: { tier: Record<string, number>; flavour: Record<string, number> }
  fill_pattern_requires: boolean
  spice_fallback: 'least-rare' | 'grey-out'
  avoided_blocks_implied: boolean
  default_rarity: string
  handling: 'default_handling'
  weapon_default_weight: number
  mount_uses_aim_rarity: boolean
  role_weight: number
  pattern_roles_first: boolean
  take_what_fits: boolean
  favoured_step: number
  flavour_lean: 'favoured' | 'weight-only' | 'step-only'
  variant_odds: 'equal'
  always_variant: boolean
  kind_odds: 'equal'
  seats: { operating: string[]; gunner: string[]; commander: string[] }
  implied_pattern_as_extra: boolean
  second_form: { via: string[]; uses_body_rule: boolean }
  adaptive: { slot: 'primary' | 'secondary'; slot_when_family_required: 'primary' | 'secondary'; when_links: Record<string, string> }
  same_mechanic_check: { related: string[]; likeness: number; likeness_of: string[]; shared_unit_entries: number }
  key_traits_only_when_implied: boolean
  primary_weapon_seat: Record<string, string>
  passengers: {
    only_from_patterns: boolean
    caps: Record<string, number>
    seat_odds: 'equal'
    kinds: Array<{ pattern?: string; variants?: string[]; kind: string }>
    note?: string
  }
  nature: Array<{ when?: Link; nature: string }>
  on_death: {
    who_gets_out: string[]
    what_is_left: string[]
    default: Record<string, string>
    default_weight: number
    crewed_machine_only: string[]
    never_together: string[][]
  }
  unarmed: { primary_roles: string[]; signature_categories: string[]; one_in: number; note?: string }
  secondary_weapon: { always_with: string; one_in: number }
  resource: string | null
  set_unguaranteed_links: boolean
  pair_within_ability: boolean
  matchup_lists: { lists: string[]; max: number; signature_first: boolean; note?: string }
  counter_check: { list: 'countered_by'; drop_unsatisfiable: boolean }
  derived_links: {
    damage_vs: string[]
    flier_hits: Record<string, Link>
    no_air_weapon: Link
    drop_immune: boolean
    counters_from_damage: boolean
  }
}

export interface RuleCounts {
  mobility_traits: Weights
  armour_models: Weights
  sight: Record<string, number>
  sight_boost: { band: string; times: number; roles: string[] }
  sensor_traits: Weights
  body_count: { squad: Weights; other: Weights }
  availability: Record<string, { weight: number; min_spice?: number; min_tier?: string }>
  weapon_traits: Weights
  conditional_weapons: Weights
  abilities: Record<string, Weights>
  second_form_weapons: Weights
  on_death: Weights
  secondary_roles: Weights
  note?: string
}

export interface RuleCooldowns {
  active: BandWeights
  toggle: BandWeights
  deploy: BandWeights
  channel: BandWeights
  ultimate: BandWeights
  hard_control: BandWeights
  hard_control_ultimate: BandWeights
  note?: string
}

/** G13 role fit: patterns = holds one of these patterns; any = one of these links holds; all = every link holds. */
export interface RoleFit {
  patterns?: string[]
  any?: Link[]
  all?: Link[]
  note?: string
}

export interface HardControlEntry {
  pattern?: string
  term?: Link
  class: 'stun' | 'latch'
  variants?: 'all' | string[]
  except?: string[]
  escape?: number | null
  escape_avoids?: boolean
  min_tier?: string
  borderline?: boolean
  never_on_card_weapon?: boolean
  escape_line?: string
}

export interface HardControl {
  classes: Record<'stun' | 'latch', { min_tier: string; key_kinds_only: boolean }>
  entries: HardControlEntry[]
  weapon_families: { families: string[]; note: string }
}

/** One side of a same-mechanic entry: a pattern, and some of its variants (none listed = every variant). */
export interface SameMechanicSide {
  pattern: string
  variants?: string[]
}

/**
 * A11: patterns Mustafa confirmed as one mechanic. Today a pair of pattern ids; the shape being discussed names each
 * side's pattern and, optionally, some of its variants, with a verdict. Both shapes are read (patterns.ts mayJoin).
 */
export type SameMechanicEntry = string[] | { a: SameMechanicSide; b: SameMechanicSide; verdict?: string; note?: string }

export interface RulesFile {
  kind: 'rules'
  version: string
  status: 'draft' | 'approved'
  defaults: RuleDefaults
  roll_order: string[]
  counts: RuleCounts
  cooldowns: RuleCooldowns
  role_fit: Record<string, RoleFit>
  hard_control: HardControl
  same_mechanic: SameMechanicEntry[]
  points: Record<string, unknown>
  layout: Record<string, string>
  attempts: number
}

// ---------------------------------------------------------------- data/generator/names.json and texts.json

/** One flavour's name words (names.json); read by the text step. */
export interface NameStyle {
  flavour_word: string
  class_nouns: Record<string, string>
  templates: string[]
  words: Record<string, Array<string | number>>
  signature_words: string[]
  note?: string
}

export type NamesFile = { kind: 'names'; version: string; status: string; signature_nouns: Record<string, string[]> } & Record<
  string,
  unknown
>

export interface TextsFile {
  kind: 'texts'
  version: string
  status: string
  templates: Record<string, Record<string, unknown>>
  derived_reasons: Record<string, string>
  escapes: Record<string, string>
  neutral: Record<string, string>
}

/** Names of real units, factions and games in the data, for the name and text checks (T-a, T-b). */
export interface RealNames {
  units: string[]
  factions: string[]
  games: Array<{ title: string; franchise?: string }>
}

/** Everything the generator reads, as one plain object. */
export interface GeneratorData {
  /** Content hash of the word lists, patterns and generator files (data/manifest.json, rule G8). */
  dataVersion: string
  vocab: Record<string, WordList>
  patterns: Pattern[]
  registry: RegistryEntry[]
  refKinds: Record<string, RefKind>
  rules: RulesFile
  names: NamesFile
  texts: TextsFile
  realNames: RealNames
}

// ---------------------------------------------------------------- the card draft
// A draft has the shape of the card's parts (schemas/concept-card.schema.json), but any value may still be open:
// undefined means "not decided yet", null means "decided: none" (an unarmed primary, no passengers, no resource).
// A list is undefined until its step has decided it; once it is a list, it is complete.

export interface WeaponDraft {
  family?: string
  damage?: string | null
  mount?: string
  delivery?: string | null
  range?: string | null
  can_target?: string[]
  affects?: 'enemies' | 'allies' | 'both'
  traits?: string[]
  seat?: string
}

export interface ConditionalDraft {
  when?: Link
  weapon: WeaponDraft
}

export interface AbilityDraft {
  pattern?: string
  variant?: string | null
  kind?: string
  seat?: string
  cooldown?: string | null
  /** Question K2: true when the signature is the card's primary weapon, fired with primary fire (not a card field yet). */
  primaryFire?: boolean
}

export interface ModeDraft {
  via?: string
  class?: string
  mobility?: { base?: string; handling?: string; speed?: string }
  armament?: WeaponDraft[]
}

export interface PassengersPart {
  seats: number
  kind: string
}

export interface DraftParts {
  class?: string
  tier?: string
  flavour?: string
  nature?: string
  availability?: string
  roles: { primary?: string; secondary?: string[] }
  mobility: { base?: string; handling?: string; traits?: string[]; speed?: string }
  body: { plan?: string; size?: string; count?: number }
  armament: { primary?: WeaponDraft | null; secondary?: WeaponDraft | null; conditional?: ConditionalDraft[] }
  armour: { class?: string; models?: string[] }
  sensors: { sight?: string; traits?: string[] }
  crew: { model?: string; solo_fallback?: string | null; passengers?: PassengersPart | null }
  signature?: AbilityDraft
  abilities?: AbilityDraft[]
  /** Draft only, never on a card: extra abilities already chosen (needed ones, step 4) while more may still come.
   *  Step 14 moves them to the front of `abilities`. Link matching and the key count see them. */
  pending?: AbilityDraft[]
  modes?: ModeDraft[]
  resource?: string | null
  on_death?: string[]
}

/** The inputs a user picks before rolling (null = let the generator choose). */
export interface Inputs {
  class: string | null
  tier: string | null
  flavour: string | null
  role: string | null
}

/** A part that can be locked (concept-card.schema.json, $defs.lockable), with the value it keeps. */
export interface LockValues {
  class: string
  tier: string
  flavour: string
  name: string
  roles: { primary: string; secondary: string[] }
  mobility: { base: string; handling: string; traits: string[] }
  speed: string
  body: { plan: string }
  size: string
  primary: WeaponDraft | null
  secondary: WeaponDraft | null
  conditional: ConditionalDraft[]
  armour: { class: string; models: string[] }
  sensors: { sight: string; traits: string[] }
  crew: { model: string; solo_fallback: string | null; passengers: PassengersPart | null; count?: number }
  signature: AbilityDraft
  abilities: AbilityDraft[]
  modes: ModeDraft[]
  resource: string | null
  on_death: string[]
}

export type LockName = keyof LockValues

/** What the caller asks for: the inputs, the spice, the seed and the locked parts with their values. */
export interface RollRequest {
  seed: string
  spice: number
  inputs?: Partial<Inputs>
  locks?: Partial<LockValues>
}

/**
 * Something the finished card must have, passed on from an earlier step to the step that owns the part (G2, G3,
 * G4, G13, M2): one of the links must hold. avoid: none of the links may hold (a pattern's excludes). forced: it comes
 * from an input or a lock, so a part above the spice gate may meet it (G5). onPrimary: the link is read on the
 * primary weapon only (G13, assault's main weapon).
 */
export interface Need {
  links: Link[]
  by: string
  rule: string
  forced: boolean
  avoid?: boolean
  onPrimary?: boolean
}

/** How one card field got its value; the trace is not part of the card. */
export interface TraceEntry {
  field: string
  value: unknown
  how: 'rolled' | 'input' | 'locked' | 'implied' | 'needed' | 'default'
  /** The input, lock, pattern or part that set or needed the value. */
  by?: string
  /** Rule codes that shaped the choice. */
  rule?: string
  /** How many values were offered for the draw (0 when the value was not rolled). */
  candidates: number
  options?: Array<{ id: string; weight: number }>
  /** The dice result: a whole number below the sum of the weights. */
  draw?: number
  /** Why a part above the spice gate (or a part the flavour avoids) was used (G5). */
  aboveGate?: string
  dropped?: Array<{ id: string; why: string }>
  note?: string
}

export interface Draft {
  seed: string
  spice: number
  attempt: number
  inputs: Inputs
  /** The locked parts, in the card schema's order. */
  locks: LockName[]
  locked: Partial<LockValues>
  /** The roll steps whose locked fields are already set on the parts (a lock is set at its own step: draft.ts). */
  lockSteps: string[]
  parts: DraftParts
  /** A locked working name (text.name). */
  name?: string
  /** The cost band, known once the balance is worked out (step 17); cost: links stay open until then. */
  costBand?: string
  needs: Need[]
  /** The steps (rules.json roll_order ids) that have run on this draft. */
  done: string[]
  trace: TraceEntry[]
}
