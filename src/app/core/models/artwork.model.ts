export interface ArtworkSummary {
  id: number;
  title: string;
  artistDisplay: string;
  dateDisplay: string;
  mediumDisplay: string;
  imageId: string | null;
  isPublicDomain: boolean;
  genres: string[];
  thumbnail: { width: number; height: number; altText: string } | null;
}

export interface ArtworkDetail extends ArtworkSummary {
  description: string | null;
  provenanceText: string | null;
  dimensions: string | null;
  creditLine: string | null;
  galleryTitle: string | null;
  department: string | null;
  classification: string | null;
  placeOfOrigin: string | null;
  styleTitle: string | null;
  colorfulness: number | null;
  hasEducationalResources: boolean;
}

export interface ArtistInfo {
  id: number;
  title: string;
  birthDate: number | null;
  deathDate: number | null;
  description: string | null;
}

export interface ArtInstituteSearchResponse {
  data: ArtInstituteArtworkRaw[];
  pagination: {
    total: number;
    current_page: number;
    total_pages: number;
    limit: number;
    offset: number;
    next_url: string | null;
  };
  config: {
    iiif_url: string;
  };
}

export interface ArtInstituteArtworkRaw {
  id: number;
  title: string;
  artist_display: string;
  date_display: string;
  medium_display: string;
  image_id: string | null;
  is_public_domain: boolean;
  genre_titles: string[];
  thumbnail: { width: number; height: number; alt_text: string } | null;
  description: string | null;
  provenance_text: string | null;
  dimensions: string | null;
  credit_line: string | null;
  gallery_title: string | null;
  department_title: string | null;
  classification_title: string | null;
  place_of_origin: string | null;
  style_title: string | null;
  colorfulness: number | null;
  has_educational_resources: boolean;
  artist_id: number | null;
  artist_title: string | null;
}
