import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProductVariant {
  attribute_name: string;
  attribute_value: string;
  cost_price?: number;
  price?: number;
  sku_variant?: string;
}

interface Product {
  name: string;
  category: string;
  default_price: number;
  description?: string;
  supplier_name: string;
  variants: ProductVariant[];
}

const productsData: Product[] = [
  {
    name: "Cartes d'affaires 14pt Lamination Mate",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier (Stock)", attribute_value: "14PT" },
      { attribute_name: "Finition (Coating)", attribute_value: "Matte Finish" },
      { attribute_name: "Impression", attribute_value: "Recto seulement (4/0)" },
      { attribute_name: "Impression", attribute_value: "Recto-Verso (4/4)" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Coins Arrondis", attribute_value: "Non" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/4\")" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/8\")" },
      { attribute_name: "Quantité", attribute_value: "25" },
      { attribute_name: "Quantité", attribute_value: "50" },
      { attribute_name: "Quantité", attribute_value: "75" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "750" },
      { attribute_name: "Quantité", attribute_value: "1000" },
      { attribute_name: "Quantité", attribute_value: "2500" },
      { attribute_name: "Quantité", attribute_value: "5000" },
    ]
  },
  {
    name: "Cartes d'affaires 14pt Fini UV (High Gloss)",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier (Stock)", attribute_value: "14PT" },
      { attribute_name: "Finition (Coating)", attribute_value: "UV (High Gloss)" },
      { attribute_name: "Impression", attribute_value: "Recto seulement (4/0)" },
      { attribute_name: "Impression", attribute_value: "Recto-Verso (4/4)" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Coins Arrondis", attribute_value: "Non" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/4\")" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/8\")" },
      { attribute_name: "Quantité", attribute_value: "25" },
      { attribute_name: "Quantité", attribute_value: "50" },
      { attribute_name: "Quantité", attribute_value: "75" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "750" },
      { attribute_name: "Quantité", attribute_value: "1000" },
      { attribute_name: "Quantité", attribute_value: "2500" },
      { attribute_name: "Quantité", attribute_value: "5000" },
    ]
  },
  {
    name: "Cartes d'affaires 14pt Fini AQ",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier (Stock)", attribute_value: "14PT" },
      { attribute_name: "Finition (Coating)", attribute_value: "AQ (Aqueous Coating)" },
      { attribute_name: "Impression", attribute_value: "Recto seulement (4/0)" },
      { attribute_name: "Impression", attribute_value: "Recto-Verso (4/4)" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Coins Arrondis", attribute_value: "Non" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/4\")" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/8\")" },
      { attribute_name: "Quantité", attribute_value: "25" },
      { attribute_name: "Quantité", attribute_value: "50" },
      { attribute_name: "Quantité", attribute_value: "75" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "750" },
      { attribute_name: "Quantité", attribute_value: "1000" },
      { attribute_name: "Quantité", attribute_value: "2500" },
      { attribute_name: "Quantité", attribute_value: "5000" },
    ]
  },
  {
    name: "Cartes d'affaires 16pt Lamination Mate",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier (Stock)", attribute_value: "16PT" },
      { attribute_name: "Finition (Coating)", attribute_value: "Matte Finish" },
      { attribute_name: "Impression", attribute_value: "Recto seulement (4/0)" },
      { attribute_name: "Impression", attribute_value: "Recto-Verso (4/4)" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Coins Arrondis", attribute_value: "Non" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/4\")" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/8\")" },
      { attribute_name: "Quantité", attribute_value: "25" },
      { attribute_name: "Quantité", attribute_value: "50" },
      { attribute_name: "Quantité", attribute_value: "75" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "750" },
      { attribute_name: "Quantité", attribute_value: "1000" },
      { attribute_name: "Quantité", attribute_value: "2500" },
      { attribute_name: "Quantité", attribute_value: "5000" },
    ]
  },
  {
    name: "Cartes d'affaires 16pt Fini UV (High Gloss)",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier (Stock)", attribute_value: "16PT" },
      { attribute_name: "Finition (Coating)", attribute_value: "UV (High Gloss)" },
      { attribute_name: "Impression", attribute_value: "Recto seulement (4/0)" },
      { attribute_name: "Impression", attribute_value: "Recto-Verso (4/4)" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Coins Arrondis", attribute_value: "Non" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/4\")" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/8\")" },
      { attribute_name: "Quantité", attribute_value: "25" },
      { attribute_name: "Quantité", attribute_value: "50" },
      { attribute_name: "Quantité", attribute_value: "75" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "750" },
      { attribute_name: "Quantité", attribute_value: "1000" },
      { attribute_name: "Quantité", attribute_value: "2500" },
      { attribute_name: "Quantité", attribute_value: "5000" },
    ]
  },
  {
    name: "Cartes d'affaires 16pt Fini AQ",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier (Stock)", attribute_value: "16PT" },
      { attribute_name: "Finition (Coating)", attribute_value: "AQ (Aqueous Coating)" },
      { attribute_name: "Impression", attribute_value: "Recto seulement (4/0)" },
      { attribute_name: "Impression", attribute_value: "Recto-Verso (4/4)" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Coins Arrondis", attribute_value: "Non" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/4\")" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/8\")" },
      { attribute_name: "Quantité", attribute_value: "25" },
      { attribute_name: "Quantité", attribute_value: "50" },
      { attribute_name: "Quantité", attribute_value: "75" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "750" },
      { attribute_name: "Quantité", attribute_value: "1000" },
      { attribute_name: "Quantité", attribute_value: "2500" },
      { attribute_name: "Quantité", attribute_value: "5000" },
    ]
  },
  {
    name: "Cartes d'affaires 18pt Lamination Mate/Soyeuse",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier (Stock)", attribute_value: "18PT" },
      { attribute_name: "Finition (Coating)", attribute_value: "Matte / Silk Lamination" },
      { attribute_name: "Impression", attribute_value: "Recto-Verso (4/4)" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Coins Arrondis", attribute_value: "Non" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/4\")" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/8\")" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "1000" },
    ]
  },
  {
    name: "Cartes d'affaires 18pt Lamination Brillante",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier (Stock)", attribute_value: "18PT" },
      { attribute_name: "Finition (Coating)", attribute_value: "Gloss Lamination" },
      { attribute_name: "Impression", attribute_value: "Recto-Verso (4/4)" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Coins Arrondis", attribute_value: "Non" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/4\")" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/8\")" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "1000" },
    ]
  },
  {
    name: "Cartes d'affaires 13pt Écologique (Enviro)",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier (Stock)", attribute_value: "13pt Enviro Uncoated" },
      { attribute_name: "Impression", attribute_value: "Recto seulement (4/0)" },
      { attribute_name: "Impression", attribute_value: "Recto-Verso (4/4)" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Coins Arrondis", attribute_value: "Non" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/4\")" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/8\")" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "1000" },
    ]
  },
  {
    name: "Cartes d'affaires 13pt en Lin (Linen)",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier (Stock)", attribute_value: "13pt Linen Uncoated" },
      { attribute_name: "Impression", attribute_value: "Recto seulement (4/0)" },
      { attribute_name: "Impression", attribute_value: "Recto-Verso (4/4)" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Coins Arrondis", attribute_value: "Non" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/4\")" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/8\")" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "1000" },
    ]
  },
  {
    name: "Cartes d'affaires 14pt Inscriptible + AQ (C1S)",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier (Stock)", attribute_value: "14PT Coated One Side (C1S)" },
      { attribute_name: "Finition (Coating)", attribute_value: "Côté 1: AQ / Côté 2: Uncoated" },
      { attribute_name: "Impression", attribute_value: "Recto-Verso (4/4)" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "1000" },
      { attribute_name: "Quantité", attribute_value: "2500" },
      { attribute_name: "Quantité", attribute_value: "5000" },
    ]
  },
  {
    name: "Cartes d'affaires 14pt Inscriptible + UV (C1S)",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier (Stock)", attribute_value: "14PT Coated One Side (C1S)" },
      { attribute_name: "Finition (Coating)", attribute_value: "Côté 1: UV / Côté 2: Uncoated" },
      { attribute_name: "Impression", attribute_value: "Recto-Verso (4/4)" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "1000" },
      { attribute_name: "Quantité", attribute_value: "2500" },
      { attribute_name: "Quantité", attribute_value: "5000" },
    ]
  },
  {
    name: "Cartes d'affaires 18pt Inscriptible (C1S)",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier (Stock)", attribute_value: "18PT Coated One Side (C1S)" },
      { attribute_name: "Finition (Coating)", attribute_value: "Côté 1: Uncoated / Côté 2: Uncoated" },
      { attribute_name: "Impression", attribute_value: "Recto-Verso (4/4)" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "1000" },
      { attribute_name: "Quantité", attribute_value: "2500" },
      { attribute_name: "Quantité", attribute_value: "5000" },
    ]
  },
  {
    name: "Cartes d'affaires avec Estampage Métallique (Foil)",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier de base", attribute_value: "22PT Soft Touch (Suede)" },
      { attribute_name: "Couleur du Foil", attribute_value: "Or" },
      { attribute_name: "Couleur du Foil", attribute_value: "Argent" },
      { attribute_name: "Couleur du Foil", attribute_value: "Cuivre" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Coins Arrondis", attribute_value: "Non" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/4\")" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/8\")" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "1000" },
    ]
  },
  {
    name: "Cartes d'affaires avec Vernis Sélectif (Spot UV)",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier de base", attribute_value: "22PT Soft Touch (Suede)" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Coins Arrondis", attribute_value: "Non" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/4\")" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/8\")" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "1000" },
    ]
  },
  {
    name: "Cartes d'affaires en Papier Kraft",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier (Stock)", attribute_value: "18PT Kraft Uncoated" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Coins Arrondis", attribute_value: "Non" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/4\")" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/8\")" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "1000" },
    ]
  },
  {
    name: "Cartes d'affaires Durables (Plastique)",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Matériel", attribute_value: "Plastique 20PT" },
      { attribute_name: "Type de Plastique", attribute_value: "Blanc Opaque" },
      { attribute_name: "Type de Plastique", attribute_value: "Clair (Transparent)" },
      { attribute_name: "Type de Plastique", attribute_value: "Givré (Frosted)" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Coins Arrondis", attribute_value: "Non" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/4\")" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/8\")" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "1000" },
      { attribute_name: "Quantité", attribute_value: "2500" },
      { attribute_name: "Quantité", attribute_value: "5000" },
    ]
  },
  {
    name: "Cartes d'affaires en Papier Nacré (Pearl)",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier (Stock)", attribute_value: "14PT Pearl Metallic" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Coins Arrondis", attribute_value: "Non" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/4\")" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/8\")" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "1000" },
    ]
  },
  {
    name: "Cartes d'affaires avec Découpe Personnalisée (Die Cut)",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier de base", attribute_value: "14PT + UV (High Gloss)" },
      { attribute_name: "Complexité de la forme", attribute_value: "Simple" },
      { attribute_name: "Complexité de la forme", attribute_value: "Complexe" },
      { attribute_name: "Taille Maximale", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "1000" },
    ]
  },
  {
    name: "Cartes d'affaires au Fini Suédé (Soft Touch)",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier (Stock)", attribute_value: "22PT Soft Touch (Suede)" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Coins Arrondis", attribute_value: "Non" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/4\")" },
      { attribute_name: "Coins Arrondis", attribute_value: "Oui (Rayon de 1/8\")" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "1000" },
    ]
  },
  {
    name: "Cartes d'affaires 32pt à Tranche Colorée",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier (Stock)", attribute_value: "32pt Uncoated (Ultra Smooth)" },
      { attribute_name: "Couleur de la tranche", attribute_value: "Noir" },
      { attribute_name: "Couleur de la tranche", attribute_value: "Bleu" },
      { attribute_name: "Couleur de la tranche", attribute_value: "Marron" },
      { attribute_name: "Couleur de la tranche", attribute_value: "Rose" },
      { attribute_name: "Couleur de la tranche", attribute_value: "Orange" },
      { attribute_name: "Couleur de la tranche", attribute_value: "Violet" },
      { attribute_name: "Couleur de la tranche", attribute_value: "Rouge" },
      { attribute_name: "Couleur de la tranche", attribute_value: "Turquoise" },
      { attribute_name: "Couleur de la tranche", attribute_value: "Jaune" },
      { attribute_name: "Couleur de la tranche", attribute_value: "Blanc" },
      { attribute_name: "Couleur de la tranche", attribute_value: "Or Métallique" },
      { attribute_name: "Couleur de la tranche", attribute_value: "Argent Métallique" },
      { attribute_name: "Couleur de la tranche", attribute_value: "Cuivre Métallique" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "1000" },
    ]
  },
  {
    name: "Cartes d'affaires 32pt Ultra Lisses (Ultra Smooth)",
    category: "Impression",
    default_price: 0,
    supplier_name: "Sinalite",
    variants: [
      { attribute_name: "Papier (Stock)", attribute_value: "32pt Uncoated" },
      { attribute_name: "Impression", attribute_value: "Recto-Verso (4/4)" },
      { attribute_name: "Taille", attribute_value: "3.5\" x 2\"" },
      { attribute_name: "Quantité", attribute_value: "100" },
      { attribute_name: "Quantité", attribute_value: "250" },
      { attribute_name: "Quantité", attribute_value: "500" },
      { attribute_name: "Quantité", attribute_value: "1000" },
    ]
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting bulk product creation...')
    
    // Get Sinalite supplier ID
    const { data: sinaliteData, error: sinaliteError } = await supabaseClient
      .from('suppliers')
      .select('id')
      .ilike('name', '%sinalite%')
      .single()

    if (sinaliteError || !sinaliteData) {
      throw new Error('Supplier Sinalite not found')
    }

    const sinaliteId = sinaliteData.id
    let createdProducts = 0
    let createdVariants = 0
    let errors = []

    for (const productData of productsData) {
      try {
        // Create product
        const { data: product, error: productError } = await supabaseClient
          .from('products')
          .insert([{
            name: productData.name,
            category: productData.category,
            default_price: productData.default_price,
            description: `Cartes d'affaires de haute qualité avec différentes options de finition et de personnalisation.`
          }])
          .select()
          .single()

        if (productError) {
          throw new Error(`Error creating product: ${productError.message}`)
        }

        console.log(`Created product: ${product.name}`)
        createdProducts++

        // Associate with Sinalite supplier
        const { error: supplierError } = await supabaseClient
          .from('product_suppliers')
          .insert([{
            product_id: product.id,
            supplier_id: sinaliteId
          }])

        if (supplierError) {
          console.error(`Error associating supplier: ${supplierError.message}`)
        }

        // Create variants
        const variantInserts = productData.variants.map(variant => ({
          product_id: product.id,
          attribute_name: variant.attribute_name,
          attribute_value: variant.attribute_value,
          cost_price: variant.cost_price || 0,
          price: variant.price || 0,
          sku_variant: variant.sku_variant || null
        }))

        const { error: variantsError } = await supabaseClient
          .from('product_variants')
          .insert(variantInserts)

        if (variantsError) {
          throw new Error(`Error creating variants: ${variantsError.message}`)
        }

        createdVariants += variantInserts.length
        console.log(`Created ${variantInserts.length} variants for ${product.name}`)

      } catch (error) {
        console.error(`Error processing product ${productData.name}:`, error)
        errors.push({
          product: productData.name,
          error: error.message
        })
      }
    }

    const result = {
      success: true,
      message: `Successfully created ${createdProducts} products with ${createdVariants} variants`,
      details: {
        createdProducts,
        createdVariants,
        errors: errors.length > 0 ? errors : null
      }
    }

    console.log('Bulk creation completed:', result)
    
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in bulk product creation:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})