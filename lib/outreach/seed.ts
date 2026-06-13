// Real instructor/driving-school prospects gathered for the Plymouth & South
// Devon patch. Used to seed the outreach CRM. Deduped on googlePlaceId.

export type SeedProspect = {
  name: string;
  area: string;
  phone?: string;
  website?: string;
  googlePlaceId: string;
  rating?: number;
  notes?: string;
};

export const SEED_PROSPECTS: SeedProspect[] = [
  { name: "Lendrums Driving School", area: "Plympton", phone: "07734 319271", website: "https://www.lendrums-driving-school.co.uk/", googlePlaceId: "ChIJjUkKtkbsbEgRdWKuI33Y7Cs", rating: 5.0, notes: "Multiple instructors — could be a team sign-up." },
  { name: "AAA School of Motoring", area: "Stonehouse", phone: "07708 737184", website: "https://www.aaa-som.co.uk/", googlePlaceId: "ChIJrVlm1yaSbEgRDVyacoM8dGE", rating: 4.8 },
  { name: "Belt Up Driving School", area: "Roborough", phone: "07904 611081", website: "http://www.beltup2drive.co.uk/", googlePlaceId: "ChIJ18UJ6H3tbEgR4pLoGg9Mp8c", rating: 4.8, notes: "Also trains new instructors — well connected locally." },
  { name: "Automatic Driving Lessons Plymouth", area: "Plymouth", phone: "07438 596383", googlePlaceId: "ChIJC8zcJmGTbEgRWKhs9yUqXhc", rating: 3.9 },
  { name: "Com'Pass Driving School", area: "Plympton", phone: "01752 339922", website: "https://www.drivingschoolsplymouth.co.uk/", googlePlaceId: "ChIJJZOr9ZPubEgRxne1HJ5fq74", rating: 4.8 },
  { name: "letspass", area: "Efford", phone: "07988 806149", website: "http://www.letspass.uk.com/", googlePlaceId: "ChIJoVgBOvfsbEgRhoY5aNKK6Ts", rating: 4.8 },
  { name: "EASY DRIVE", area: "Plymouth", phone: "07739 552740", website: "https://easy-drive.ueniweb.com/", googlePlaceId: "ChIJ00Ulix2TbEgR6VvOGrYROlU", rating: 5.0 },
  { name: "Eco-Drive", area: "Hyde Park", phone: "07738 815137", website: "http://www.eco-drive-school.co.uk/", googlePlaceId: "ChIJ_SF-XczsbEgROBupits7-ZM", rating: 5.0 },
  { name: "Plymouth Driving Academy", area: "St Judes", googlePlaceId: "ChIJNf48YLDsbEgRS46ldygV2GU", rating: 5.0 },
  { name: "Andy Robinson Driving School", area: "Roborough", phone: "07811 958667", website: "https://www.andyrobinsondrivingschool.com/", googlePlaceId: "ChIJW2bXmhjtbEgRMH3ehj82esY", rating: 4.7 },
  { name: "Dave Upcott ADI", area: "Plympton", phone: "07919 800791", website: "https://www.dui9800.co.uk/", googlePlaceId: "ChIJVe_Xqq7tbEgRm58Tm-eqqjQ", rating: 5.0 },
  { name: "LDC Driving School: Richard Hooper", area: "Plympton", phone: "07841 034340", website: "http://courseswithrichard.co.uk/", googlePlaceId: "ChIJuZG3aiTtbEgR7c42Tm0hOTI" },
  { name: "B Safe 2 Drive", area: "Chaddlewood", phone: "01752 246208", website: "http://www.bsafe2drive.co.uk/", googlePlaceId: "ChIJg-0P_ZPubEgRQ7veoXJCmGk", rating: 3.0 },
  { name: "LISA School of Motoring", area: "Plymstock", phone: "07775 905598", website: "https://www.lisaschoolofmotoring.co.uk/", googlePlaceId: "ChIJdRZNTCrrbEgRPhP5uHSB2Ys", rating: 4.0 },
  { name: "Buckland Driving School", area: "Ivybridge", phone: "07837 568872", website: "http://bucklanddriving.co.uk/", googlePlaceId: "ChIJEfYO_b3lbEgR7-jqZL319T4", rating: 4.7 },
  { name: "Greg Tompkins ADI", area: "Ivybridge", phone: "07471 199149", googlePlaceId: "ChIJsQ_AF6LlbEgR7IVbjm_IdL4", rating: 5.0 },
  { name: "APB Driving School", area: "Saltash", phone: "07976 046985", googlePlaceId: "ChIJ_XLJALaPbEgRSLVjz34DD0U", rating: 5.0 },
  { name: "1st 4 Driving", area: "Callington", phone: "0330 223 3123", website: "https://1st4driving.co.uk/", googlePlaceId: "ChIJl8_F9g2PbEgR2-ASFjDih7M", rating: 4.9, notes: "National franchise — local instructors may still be interested." },
  { name: "Mike L's Driving School", area: "Tavistock", phone: "01822 833429", website: "http://www.mikesdrivingschool.co.uk/", googlePlaceId: "ChIJGVQIfneMbEgRyqgrtiOEz8o" },
  { name: "Hackworthy Driving Schools", area: "Tavistock", phone: "01822 614333", googlePlaceId: "ChIJYQrwPcX0bEgRY9UcaFAGknE" },
  { name: "Mo Khan Driving School", area: "Kingsbridge", phone: "07803 183818", googlePlaceId: "ChIJE4KSE_fhbEgRKPYkj4ufOwI", rating: 5.0 },
  { name: "Richard Curzon Driver Training", area: "Kingsbridge", phone: "07878 958192", googlePlaceId: "ChIJaXb3_xLhbEgRKCNT9iB-AH0", rating: 5.0, notes: "Local to the South Hams — strong fit." },
  { name: "Scott Tibbles Driver Training", area: "Kingsbridge", phone: "07836 244243", website: "https://www.scotttibblesdrivertraining.co.uk/", googlePlaceId: "ChIJa0kyVFzfbEgR2nsllCb9Pnk" },
  { name: "GTi Driving Ltd", area: "Kingsbridge", phone: "07803 753379", googlePlaceId: "ChIJ5RRVTZYvvCMRhAdwwHEys0k" },
];
