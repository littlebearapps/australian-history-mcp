/**
 * Tool Index for Dynamic Discovery
 *
 * Contains metadata for all 75 tools across 11 sources.
 * Used by the `tools` meta-tool for keyword-based discovery.
 */

// ============================================================================
// Types
// ============================================================================

export type ToolCategory = 'search' | 'get' | 'list' | 'harvest';

export interface ToolEntry {
  /** Tool name as registered (e.g., "prov_search") */
  name: string;
  /** Source identifier (e.g., "prov") */
  source: string;
  /** Human-readable source name */
  sourceDisplay: string;
  /** Tool category for filtering */
  category: ToolCategory;
  /** Keywords for discovery matching */
  keywords: string[];
  /** Short description (from tool schema) */
  description: string;
  /** Whether source requires authentication */
  authRequired: boolean;
}

// ============================================================================
// Source Metadata
// ============================================================================

export const SOURCES = {
  prov: { display: 'PROV', auth: false },
  trove: { display: 'Trove', auth: true },
  museumsvic: { display: 'Museums Victoria', auth: false },
  ala: { display: 'ALA', auth: false },
  nma: { display: 'NMA', auth: false },
  vhd: { display: 'VHD', auth: false },
  acmi: { display: 'ACMI', auth: false },
  ghap: { display: 'GHAP', auth: false },
  'ga-hap': { display: 'GA HAP', auth: false },
  'pm-transcripts': { display: 'PM Transcripts', auth: false },
  iiif: { display: 'IIIF', auth: false },
} as const;

export type SourceName = keyof typeof SOURCES;

// ============================================================================
// Tool Index
// ============================================================================

export const TOOL_INDEX: ToolEntry[] = [
  // ---------------------------------------------------------------------------
  // PROV - Public Record Office Victoria (6 tools)
  // ---------------------------------------------------------------------------
  {
    name: 'prov_search',
    source: 'prov',
    sourceDisplay: 'PROV',
    category: 'search',
    keywords: ['victoria', 'archives', 'photos', 'maps', 'records', 'government', 'state'],
    description: 'Search Victorian state archives: photos, maps, records.',
    authRequired: false,
  },
  {
    name: 'prov_get_images',
    source: 'prov',
    sourceDisplay: 'PROV',
    category: 'get',
    keywords: ['victoria', 'images', 'iiif', 'manifest', 'digitised', 'download'],
    description: 'Extract image URLs from PROV IIIF manifest.',
    authRequired: false,
  },
  {
    name: 'prov_harvest',
    source: 'prov',
    sourceDisplay: 'PROV',
    category: 'harvest',
    keywords: ['victoria', 'archives', 'bulk', 'download', 'export', 'batch'],
    description: 'Bulk download PROV records with pagination.',
    authRequired: false,
  },
  {
    name: 'prov_get_series',
    source: 'prov',
    sourceDisplay: 'PROV',
    category: 'get',
    keywords: ['victoria', 'series', 'vprs', 'collection', 'metadata'],
    description: 'Get PROV series details by VPRS number.',
    authRequired: false,
  },
  {
    name: 'prov_get_agency',
    source: 'prov',
    sourceDisplay: 'PROV',
    category: 'get',
    keywords: ['victoria', 'agency', 'va', 'government', 'department', 'organisation'],
    description: 'Get PROV agency details by VA number.',
    authRequired: false,
  },
  {
    name: 'prov_get_items',
    source: 'prov',
    sourceDisplay: 'PROV',
    category: 'get',
    keywords: ['prov', 'items', 'series', 'vprs', 'records', 'victoria'],
    description: 'Get items within a PROV series by VPRS number.',
    authRequired: false,
  },

  // ---------------------------------------------------------------------------
  // Trove - National Library of Australia (14 tools)
  // ---------------------------------------------------------------------------
  {
    name: 'trove_search',
    source: 'trove',
    sourceDisplay: 'Trove',
    category: 'search',
    keywords: ['newspapers', 'articles', 'books', 'images', 'magazines', 'gazettes', 'national', 'library'],
    description: 'Search Australian newspapers, gazettes, images, books.',
    authRequired: true,
  },
  {
    name: 'trove_harvest',
    source: 'trove',
    sourceDisplay: 'Trove',
    category: 'harvest',
    keywords: ['newspapers', 'bulk', 'download', 'export', 'batch', 'articles'],
    description: 'Bulk download Trove records with pagination.',
    authRequired: true,
  },
  {
    name: 'trove_newspaper_article',
    source: 'trove',
    sourceDisplay: 'Trove',
    category: 'get',
    keywords: ['newspaper', 'article', 'ocr', 'text', 'pdf', 'fulltext'],
    description: 'Get article details with OCR text and PDF.',
    authRequired: true,
  },
  {
    name: 'trove_list_titles',
    source: 'trove',
    sourceDisplay: 'Trove',
    category: 'list',
    keywords: ['newspapers', 'titles', 'publications', 'gazettes', 'browse'],
    description: 'List newspaper or gazette titles by state.',
    authRequired: true,
  },
  {
    name: 'trove_title_details',
    source: 'trove',
    sourceDisplay: 'Trove',
    category: 'get',
    keywords: ['newspaper', 'title', 'years', 'issues', 'publication', 'dates'],
    description: 'Get title details with years and issues.',
    authRequired: true,
  },
  {
    name: 'trove_get_contributor',
    source: 'trove',
    sourceDisplay: 'Trove',
    category: 'get',
    keywords: ['library', 'contributor', 'nuc', 'institution', 'collection'],
    description: 'Get contributor details by NUC code.',
    authRequired: true,
  },
  {
    name: 'trove_list_contributors',
    source: 'trove',
    sourceDisplay: 'Trove',
    category: 'list',
    keywords: ['libraries', 'contributors', 'institutions', 'nuc', 'browse'],
    description: 'List/search 1500+ contributing libraries.',
    authRequired: true,
  },
  {
    name: 'trove_list_magazine_titles',
    source: 'trove',
    sourceDisplay: 'Trove',
    category: 'list',
    keywords: ['magazines', 'periodicals', 'journals', 'browse', 'titles'],
    description: 'List available magazine titles.',
    authRequired: true,
  },
  {
    name: 'trove_get_magazine_title',
    source: 'trove',
    sourceDisplay: 'Trove',
    category: 'get',
    keywords: ['magazine', 'periodical', 'journal', 'years', 'issues'],
    description: 'Get magazine title details with years/issues.',
    authRequired: true,
  },
  {
    name: 'trove_get_work',
    source: 'trove',
    sourceDisplay: 'Trove',
    category: 'get',
    keywords: ['book', 'image', 'map', 'music', 'work', 'holdings', 'library'],
    description: 'Get work details (book, image, map, music).',
    authRequired: true,
  },
  {
    name: 'trove_get_person',
    source: 'trove',
    sourceDisplay: 'Trove',
    category: 'get',
    keywords: ['person', 'biography', 'organisation', 'people', 'author'],
    description: 'Get person/organisation biographical data.',
    authRequired: true,
  },
  {
    name: 'trove_get_list',
    source: 'trove',
    sourceDisplay: 'Trove',
    category: 'get',
    keywords: ['list', 'curated', 'research', 'collection', 'user'],
    description: 'Get user-curated research list by ID.',
    authRequired: true,
  },
  {
    name: 'trove_search_people',
    source: 'trove',
    sourceDisplay: 'Trove',
    category: 'search',
    keywords: ['people', 'persons', 'organisations', 'biography', 'search'],
    description: 'Search people and organisations.',
    authRequired: true,
  },
  {
    name: 'trove_get_versions',
    source: 'trove',
    sourceDisplay: 'Trove',
    category: 'get',
    keywords: ['trove', 'versions', 'holdings', 'work', 'editions', 'formats'],
    description: 'Get all versions of a work with holdings information.',
    authRequired: true,
  },

  // ---------------------------------------------------------------------------
  // Museums Victoria (6 tools)
  // ---------------------------------------------------------------------------
  {
    name: 'museumsvic_search',
    source: 'museumsvic',
    sourceDisplay: 'Museums Victoria',
    category: 'search',
    keywords: ['museum', 'victoria', 'objects', 'specimens', 'species', 'natural', 'history'],
    description: 'Search museum objects, specimens, species, and articles.',
    authRequired: false,
  },
  {
    name: 'museumsvic_get_article',
    source: 'museumsvic',
    sourceDisplay: 'Museums Victoria',
    category: 'get',
    keywords: ['article', 'educational', 'museum', 'story', 'content'],
    description: 'Get educational article by ID.',
    authRequired: false,
  },
  {
    name: 'museumsvic_get_item',
    source: 'museumsvic',
    sourceDisplay: 'Museums Victoria',
    category: 'get',
    keywords: ['item', 'object', 'artefact', 'museum', 'collection'],
    description: 'Get museum object by ID.',
    authRequired: false,
  },
  {
    name: 'museumsvic_get_species',
    source: 'museumsvic',
    sourceDisplay: 'Museums Victoria',
    category: 'get',
    keywords: ['species', 'animal', 'plant', 'taxonomy', 'wildlife', 'victoria'],
    description: 'Get species info by ID.',
    authRequired: false,
  },
  {
    name: 'museumsvic_get_specimen',
    source: 'museumsvic',
    sourceDisplay: 'Museums Victoria',
    category: 'get',
    keywords: ['specimen', 'natural', 'science', 'fossil', 'mineral', 'insect'],
    description: 'Get natural science specimen by ID.',
    authRequired: false,
  },
  {
    name: 'museumsvic_harvest',
    source: 'museumsvic',
    sourceDisplay: 'Museums Victoria',
    category: 'harvest',
    keywords: ['museum', 'victoria', 'bulk', 'download', 'export', 'batch'],
    description: 'Bulk download museum records.',
    authRequired: false,
  },

  // ---------------------------------------------------------------------------
  // ALA - Atlas of Living Australia (8 tools)
  // ---------------------------------------------------------------------------
  {
    name: 'ala_search_occurrences',
    source: 'ala',
    sourceDisplay: 'ALA',
    category: 'search',
    keywords: ['species', 'occurrences', 'sightings', 'specimens', 'biodiversity', 'wildlife'],
    description: 'Search species occurrences (sightings, specimens, observations).',
    authRequired: false,
  },
  {
    name: 'ala_search_species',
    source: 'ala',
    sourceDisplay: 'ALA',
    category: 'search',
    keywords: ['species', 'taxonomy', 'animals', 'plants', 'scientific', 'common', 'name'],
    description: 'Search species by scientific or common name.',
    authRequired: false,
  },
  {
    name: 'ala_get_species',
    source: 'ala',
    sourceDisplay: 'ALA',
    category: 'get',
    keywords: ['species', 'profile', 'taxonomy', 'guid', 'details', 'classification'],
    description: 'Get species profile by GUID.',
    authRequired: false,
  },
  {
    name: 'ala_search_images',
    source: 'ala',
    sourceDisplay: 'ALA',
    category: 'search',
    keywords: ['images', 'photos', 'species', 'wildlife', 'nature', 'pictures'],
    description: 'Search species images.',
    authRequired: false,
  },
  {
    name: 'ala_match_name',
    source: 'ala',
    sourceDisplay: 'ALA',
    category: 'get',
    keywords: ['taxonomy', 'name', 'match', 'scientific', 'classification', 'resolve'],
    description: 'Match scientific name to ALA taxonomy.',
    authRequired: false,
  },
  {
    name: 'ala_list_species_lists',
    source: 'ala',
    sourceDisplay: 'ALA',
    category: 'list',
    keywords: ['species', 'lists', 'curated', 'collections', 'browse'],
    description: 'List curated species lists.',
    authRequired: false,
  },
  {
    name: 'ala_get_species_list',
    source: 'ala',
    sourceDisplay: 'ALA',
    category: 'get',
    keywords: ['species', 'list', 'curated', 'collection', 'details'],
    description: 'Get species list by ID.',
    authRequired: false,
  },
  {
    name: 'ala_harvest',
    source: 'ala',
    sourceDisplay: 'ALA',
    category: 'harvest',
    keywords: ['species', 'occurrences', 'bulk', 'download', 'export', 'batch'],
    description: 'Bulk download species occurrence records.',
    authRequired: false,
  },

  // ---------------------------------------------------------------------------
  // NMA - National Museum of Australia (10 tools)
  // ---------------------------------------------------------------------------
  {
    name: 'nma_search_objects',
    source: 'nma',
    sourceDisplay: 'NMA',
    category: 'search',
    keywords: ['museum', 'objects', 'artefacts', 'collection', 'national', 'australia'],
    description: 'Search museum collection objects.',
    authRequired: false,
  },
  {
    name: 'nma_get_object',
    source: 'nma',
    sourceDisplay: 'NMA',
    category: 'get',
    keywords: ['object', 'artefact', 'item', 'museum', 'details'],
    description: 'Get museum object by ID.',
    authRequired: false,
  },
  {
    name: 'nma_search_places',
    source: 'nma',
    sourceDisplay: 'NMA',
    category: 'search',
    keywords: ['places', 'locations', 'sites', 'geography', 'collection'],
    description: 'Search places associated with collection objects.',
    authRequired: false,
  },
  {
    name: 'nma_get_place',
    source: 'nma',
    sourceDisplay: 'NMA',
    category: 'get',
    keywords: ['place', 'location', 'site', 'geography', 'details'],
    description: 'Get place by ID.',
    authRequired: false,
  },
  {
    name: 'nma_search_parties',
    source: 'nma',
    sourceDisplay: 'NMA',
    category: 'search',
    keywords: ['people', 'organisations', 'parties', 'creators', 'makers'],
    description: 'Search people and organisations.',
    authRequired: false,
  },
  {
    name: 'nma_get_party',
    source: 'nma',
    sourceDisplay: 'NMA',
    category: 'get',
    keywords: ['person', 'organisation', 'party', 'creator', 'details'],
    description: 'Get person or organisation by ID.',
    authRequired: false,
  },
  {
    name: 'nma_search_media',
    source: 'nma',
    sourceDisplay: 'NMA',
    category: 'search',
    keywords: ['media', 'images', 'videos', 'sound', 'recordings', 'photos'],
    description: 'Search images, videos, and sound recordings.',
    authRequired: false,
  },
  {
    name: 'nma_get_media',
    source: 'nma',
    sourceDisplay: 'NMA',
    category: 'get',
    keywords: ['media', 'image', 'video', 'sound', 'recording', 'details'],
    description: 'Get media item by ID.',
    authRequired: false,
  },
  {
    name: 'nma_harvest',
    source: 'nma',
    sourceDisplay: 'NMA',
    category: 'harvest',
    keywords: ['museum', 'objects', 'bulk', 'download', 'export', 'batch'],
    description: 'Bulk download museum collection objects.',
    authRequired: false,
  },
  {
    name: 'nma_get_related',
    source: 'nma',
    sourceDisplay: 'NMA',
    category: 'get',
    keywords: ['nma', 'related', 'links', 'objects', 'places', 'parties'],
    description: 'Get related objects, places, and parties from _links.',
    authRequired: false,
  },

  // ---------------------------------------------------------------------------
  // VHD - Victorian Heritage Database (9 tools)
  // ---------------------------------------------------------------------------
  {
    name: 'vhd_search_places',
    source: 'vhd',
    sourceDisplay: 'VHD',
    category: 'search',
    keywords: ['heritage', 'places', 'buildings', 'sites', 'victoria', 'architecture'],
    description: 'Search Victorian heritage places.',
    authRequired: false,
  },
  {
    name: 'vhd_get_place',
    source: 'vhd',
    sourceDisplay: 'VHD',
    category: 'get',
    keywords: ['heritage', 'place', 'building', 'site', 'details', 'history'],
    description: 'Get heritage place by ID.',
    authRequired: false,
  },
  {
    name: 'vhd_search_shipwrecks',
    source: 'vhd',
    sourceDisplay: 'VHD',
    category: 'search',
    keywords: ['shipwrecks', 'maritime', 'ships', 'wrecks', 'coast', 'victoria'],
    description: 'Search Victorian shipwrecks.',
    authRequired: false,
  },
  {
    name: 'vhd_get_shipwreck',
    source: 'vhd',
    sourceDisplay: 'VHD',
    category: 'get',
    keywords: ['shipwreck', 'maritime', 'ship', 'wreck', 'details', 'history'],
    description: 'Get shipwreck by ID.',
    authRequired: false,
  },
  {
    name: 'vhd_list_municipalities',
    source: 'vhd',
    sourceDisplay: 'VHD',
    category: 'list',
    keywords: ['municipalities', 'councils', 'lga', 'victoria', 'local', 'government'],
    description: 'List Victorian municipalities (LGAs).',
    authRequired: false,
  },
  {
    name: 'vhd_list_architectural_styles',
    source: 'vhd',
    sourceDisplay: 'VHD',
    category: 'list',
    keywords: ['architecture', 'styles', 'design', 'buildings', 'classification'],
    description: 'List architectural style classifications.',
    authRequired: false,
  },
  {
    name: 'vhd_list_themes',
    source: 'vhd',
    sourceDisplay: 'VHD',
    category: 'list',
    keywords: ['themes', 'heritage', 'history', 'categories', 'classification'],
    description: 'List heritage themes.',
    authRequired: false,
  },
  {
    name: 'vhd_list_periods',
    source: 'vhd',
    sourceDisplay: 'VHD',
    category: 'list',
    keywords: ['periods', 'eras', 'dates', 'history', 'timeline', 'classification'],
    description: 'List heritage time periods.',
    authRequired: false,
  },
  {
    name: 'vhd_harvest',
    source: 'vhd',
    sourceDisplay: 'VHD',
    category: 'harvest',
    keywords: ['heritage', 'places', 'bulk', 'download', 'export', 'batch'],
    description: 'Bulk download heritage place records.',
    authRequired: false,
  },

  // ---------------------------------------------------------------------------
  // ACMI - Australian Centre for the Moving Image (8 tools)
  // ---------------------------------------------------------------------------
  {
    name: 'acmi_search_works',
    source: 'acmi',
    sourceDisplay: 'ACMI',
    category: 'search',
    keywords: ['films', 'movies', 'television', 'tv', 'videogames', 'digital', 'art'],
    description: 'Search films, TV, videogames, and digital art.',
    authRequired: false,
  },
  {
    name: 'acmi_get_work',
    source: 'acmi',
    sourceDisplay: 'ACMI',
    category: 'get',
    keywords: ['film', 'movie', 'television', 'videogame', 'work', 'details'],
    description: 'Get work by ID.',
    authRequired: false,
  },
  {
    name: 'acmi_list_creators',
    source: 'acmi',
    sourceDisplay: 'ACMI',
    category: 'list',
    keywords: ['creators', 'directors', 'actors', 'studios', 'filmmakers', 'browse'],
    description: 'List creators (directors, actors, studios).',
    authRequired: false,
  },
  // acmi_get_creator removed: ACMI API bug - IDs from list return 404 on get
  {
    name: 'acmi_list_constellations',
    source: 'acmi',
    sourceDisplay: 'ACMI',
    category: 'list',
    keywords: ['constellations', 'collections', 'curated', 'themes', 'browse'],
    description: 'List curated thematic collections.',
    authRequired: false,
  },
  {
    name: 'acmi_get_constellation',
    source: 'acmi',
    sourceDisplay: 'ACMI',
    category: 'get',
    keywords: ['constellation', 'collection', 'curated', 'theme', 'details'],
    description: 'Get constellation by ID.',
    authRequired: false,
  },
  {
    name: 'acmi_harvest',
    source: 'acmi',
    sourceDisplay: 'ACMI',
    category: 'harvest',
    keywords: ['films', 'collection', 'bulk', 'download', 'export', 'batch'],
    description: 'Bulk download collection works.',
    authRequired: false,
  },
  {
    name: 'acmi_get_related',
    source: 'acmi',
    sourceDisplay: 'ACMI',
    category: 'get',
    keywords: ['acmi', 'related', 'parts', 'groups', 'series', 'episodes'],
    description: 'Get related works including parts, groups, and recommendations.',
    authRequired: false,
  },

  // ---------------------------------------------------------------------------
  // GHAP - Gazetteer of Historical Australian Placenames (5 tools)
  // ---------------------------------------------------------------------------
  {
    name: 'ghap_search',
    source: 'ghap',
    sourceDisplay: 'GHAP',
    category: 'search',
    keywords: ['placenames', 'locations', 'coordinates', 'historical', 'geography', 'australia'],
    description: 'Search historical Australian placenames with coordinates.',
    authRequired: false,
  },
  {
    name: 'ghap_get_place',
    source: 'ghap',
    sourceDisplay: 'GHAP',
    category: 'get',
    keywords: ['placename', 'location', 'coordinates', 'geography', 'details'],
    description: 'Get place details by TLCMap ID.',
    authRequired: false,
  },
  {
    name: 'ghap_list_layers',
    source: 'ghap',
    sourceDisplay: 'GHAP',
    category: 'list',
    keywords: ['layers', 'datasets', 'community', 'tlcmap', 'browse'],
    description: 'List community-contributed TLCMap data layers.',
    authRequired: false,
  },
  {
    name: 'ghap_get_layer',
    source: 'ghap',
    sourceDisplay: 'GHAP',
    category: 'get',
    keywords: ['layer', 'dataset', 'places', 'community', 'tlcmap'],
    description: 'Get all places from a TLCMap data layer.',
    authRequired: false,
  },
  {
    name: 'ghap_harvest',
    source: 'ghap',
    sourceDisplay: 'GHAP',
    category: 'harvest',
    keywords: ['placenames', 'coordinates', 'bulk', 'download', 'export', 'batch'],
    description: 'Bulk download placename records (330,000+ available).',
    authRequired: false,
  },

  // ---------------------------------------------------------------------------
  // GA HAP - Geoscience Australia Historical Aerial Photography (3 tools)
  // ---------------------------------------------------------------------------
  {
    name: 'ga_hap_search',
    source: 'ga-hap',
    sourceDisplay: 'GA HAP',
    category: 'search',
    keywords: ['aerial', 'photos', 'photography', 'historical', 'geoscience', 'australia'],
    description: 'Search historical aerial photos (1928-1996).',
    authRequired: false,
  },
  {
    name: 'ga_hap_get_photo',
    source: 'ga-hap',
    sourceDisplay: 'GA HAP',
    category: 'get',
    keywords: ['aerial', 'photo', 'photography', 'film', 'frame', 'details'],
    description: 'Get aerial photo by ID or film/run/frame.',
    authRequired: false,
  },
  {
    name: 'ga_hap_harvest',
    source: 'ga-hap',
    sourceDisplay: 'GA HAP',
    category: 'harvest',
    keywords: ['aerial', 'photos', 'bulk', 'download', 'export', 'batch'],
    description: 'Bulk download aerial photo records.',
    authRequired: false,
  },

  // ---------------------------------------------------------------------------
  // PM Transcripts - Prime Ministerial Transcripts (5 tools)
  // ---------------------------------------------------------------------------
  {
    name: 'pm_transcripts_get_transcript',
    source: 'pm-transcripts',
    sourceDisplay: 'PM Transcripts',
    category: 'get',
    keywords: ['transcript', 'speech', 'prime', 'minister', 'politics', 'government'],
    description: 'Get Prime Ministerial transcript by ID.',
    authRequired: false,
  },
  {
    name: 'pm_transcripts_harvest',
    source: 'pm-transcripts',
    sourceDisplay: 'PM Transcripts',
    category: 'harvest',
    keywords: ['transcripts', 'speeches', 'bulk', 'download', 'export', 'batch'],
    description: 'Bulk download PM transcripts with filters.',
    authRequired: false,
  },
  {
    name: 'pm_transcripts_search',
    source: 'pm-transcripts',
    sourceDisplay: 'PM Transcripts',
    category: 'search',
    keywords: ['pm', 'transcripts', 'search', 'fts5', 'fulltext', 'speeches'],
    description: 'Full-text search PM transcripts using FTS5 index.',
    authRequired: false,
  },
  {
    name: 'pm_transcripts_build_index',
    source: 'pm-transcripts',
    sourceDisplay: 'PM Transcripts',
    category: 'search',
    keywords: ['pm', 'transcripts', 'index', 'build', 'fts5'],
    description: 'Build or update the FTS5 full-text search index.',
    authRequired: false,
  },
  {
    name: 'pm_transcripts_index_stats',
    source: 'pm-transcripts',
    sourceDisplay: 'PM Transcripts',
    category: 'search',
    keywords: ['pm', 'transcripts', 'index', 'stats', 'coverage'],
    description: 'Get FTS5 index statistics and PM coverage.',
    authRequired: false,
  },

  // ---------------------------------------------------------------------------
  // IIIF - International Image Interoperability Framework (2 tools)
  // ---------------------------------------------------------------------------
  {
    name: 'iiif_get_manifest',
    source: 'iiif',
    sourceDisplay: 'IIIF',
    category: 'get',
    keywords: ['iiif', 'manifest', 'images', 'museum', 'library', 'digitised'],
    description: 'Fetch and parse IIIF manifest from any institution.',
    authRequired: false,
  },
  {
    name: 'iiif_get_image_url',
    source: 'iiif',
    sourceDisplay: 'IIIF',
    category: 'get',
    keywords: ['iiif', 'image', 'url', 'size', 'format', 'construct'],
    description: 'Construct IIIF Image API URL for any size/format.',
    authRequired: false,
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Find tools matching optional query, source, and category filters
 */
export function findTools(
  query?: string,
  source?: string,
  category?: ToolCategory
): ToolEntry[] {
  let results = [...TOOL_INDEX];

  // Filter by source
  if (source) {
    results = results.filter((t) => t.source === source);
  }

  // Filter by category
  if (category) {
    results = results.filter((t) => t.category === category);
  }

  // Filter by query (search name, description, keywords)
  if (query) {
    const q = query.toLowerCase();
    results = results.filter((t) => {
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.includes(q))
      );
    });
  }

  return results;
}

/**
 * Get a specific tool entry by name
 */
export function getToolEntry(name: string): ToolEntry | undefined {
  return TOOL_INDEX.find((t) => t.name === name);
}

/**
 * Get all tools for a source
 */
export function getToolsBySource(source: string): ToolEntry[] {
  return TOOL_INDEX.filter((t) => t.source === source);
}

/**
 * Get all tools in a category
 */
export function getToolsByCategory(category: ToolCategory): ToolEntry[] {
  return TOOL_INDEX.filter((t) => t.category === category);
}

/**
 * Get list of all source names
 */
export function getSourceNames(): string[] {
  return Object.keys(SOURCES);
}
