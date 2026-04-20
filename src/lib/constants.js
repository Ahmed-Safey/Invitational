// Shared domain constants. Keep a single source of truth so Seasons.addSeason
// and ProgramsAdmin.addMissingSlots don't drift apart when we add a new
// program document type.

export const PROGRAM_TYPES = ['entry_file', 'heat_sheet', 'program_booklet', 'psych_sheet']

export const PROGRAM_TYPE_LABELS = {
  entry_file: 'Entry File (.cl2)',
  heat_sheet: 'Heat Sheets',
  program_booklet: 'Program Booklet',
  psych_sheet: 'Psych Sheets',
}

// Build the default program rows for a newly created season.
export const buildProgramSlotsForSeason = (slug, label) =>
  PROGRAM_TYPES.map(t => ({
    season_slug: slug,
    program_type: t,
    label: `${label} ${PROGRAM_TYPE_LABELS[t]}`,
    is_published: false,
  }))
