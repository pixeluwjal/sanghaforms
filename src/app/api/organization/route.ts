import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Organization from "@/models/Organization";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const organizations = await Organization.find();

    if (organizations.length === 0) {
      // Seed initial data if empty
      const initialData = [
        {
          _id: "vibhaaga_001",
          name: "Dakshina Vibhaaga",
          khandas: [
            {
              _id: "khanda_vjn",
              name: "Vijayanagar Khanda",
              code: "VJN",
              valays: [
                {
                  _id: "valay_vjn_1",
                  name: "VijayaNagar Valay",
                  milans: [
                    "Vijayanagara Milan",
                    "Hampinagara Milan",
                    "Attiguppe Milan",
                  ],
                },
                {
                  _id: "valay_vjn_2",
                  name: "GovindarajaNagar Valay",
                  milans: [
                    "Saraswatinagara Milan",
                    "MC Layout Milan",
                    "Kalyananagara Milan",
                  ],
                },
                {
                  _id: "valay_vjn_3",
                  name: "Nagarabhavi Valay",
                  milans: [
                    "Chandra Layout Milan",
                    "Nagarabhavi Milan",
                    "Jnanabharati Milan",
                  ],
                },
                {
                  _id: "valay_vjn_4",
                  name: "Kengeri Valay",
                  milans: [
                    "Bandematha Milan",
                    "Doddabele Milan",
                    "Kumbalagodu Milan",
                  ],
                },
                {
                  _id: "valay_vjn_5",
                  name: "Vishweshwaraiah Valay",
                  milans: ["Annapurneshwarinagara Milan", "Bharatnagara Milan"],
                },
              ],
            },
            {
              _id: "khanda_skpm",
              name: "Sri Krishna Puram Khanda",
              code: "SKPM",
              valays: [],
              milans: [
                "Basavangudi Milan",
                "HanumanthaNagar Milan",
                "Girinagar Milan",
                "Chennamanaker Achukattu Milan",
                "Banashankari Milan",
              ],
            },
            {
              _id: "khanda_bsk",
              name: "Shankarpuram Khanda",
              code: "BSK",
              valays: [
                {
                  _id: "valay_bsk_1",
                  name: "Srinivasapura Valaya",
                  milans: [
                    "Kodipalya IT Karya Milan",
                    "Krishna Garden IT Karya Milan",
                    "Srinivaspura IT Karya Milan",
                    "Vijayashree Layout IT Karya Milan",
                  ],
                },
                {
                  _id: "valay_bsk_2",
                  name: "Banashankari Valaya",
                  milans: [
                    "Kathriguppe IT Karya Milan",
                    "Kumaraswamy Layout Milan",
                    "Chikkalsandra IT Karya Milan",
                    "Yelachenahalli IT Karya Milan",
                  ],
                },
                {
                  _id: "valay_bsk_3",
                  name: "Rajarajeshwari Nagara Valaya",
                  milans: [
                    "Kenchanahalli IT Karya Milan",
                    "Poornapragna IT Karya Milan",
                    "Rajarajeshwari IT Karya Milan",
                    "Sacchidananda Nagar IT Karya Milan",
                  ],
                },
                {
                  _id: "valay_bsk_4",
                  name: "Vasantapura Valaya",
                  milans: [
                    "Turahalli Milan",
                    "Vasanta Vallabha Nagara Milan",
                    "Gokulam Milan",
                    "Reshme Nagar Milan",
                    "Gubblala Milan",
                    "Pavamanapura Milan",
                  ],
                },
              ],
            },
            {
              _id: "khanda_btm",
              name: "BTM Khanda",
              code: "BTM",
              valays: [
                {
                  _id: "valay_btm_1",
                  name: "Jayanagar Valay",
                  milans: [
                    "Jayanagar Milan",
                    "Yediyur Milan",
                    "Ragigudda Milan",
                    "JP Nagar Phase 1 Milan",
                  ],
                },
                {
                  _id: "valay_btm_2",
                  name: "BTM Valay",
                  milans: [
                    "BTM Milan",
                    "Shri Ram Milan",
                    "SG Palya Milan",
                    "Maruti Nagar Milan",
                  ],
                },
                {
                  _id: "valay_btm_3",
                  name: "Koramangala Valay",
                  milans: [
                    "Venkatapura Milan",
                    "ST Bed Milan",
                    "Kormangala Milan",
                  ],
                },
              ],
            },
            {
              _id: "khanda_ark",
              name: "Arakere Khanda",
              code: "ARK",
              valays: [
                {
                  _id: "valay_ark_1",
                  name: "Puttenahalli Valay",
                  milans: [
                    "Arekere Milan",
                    "Puttenahalli Milan",
                    "Jambusavari Dinne",
                  ],
                },
                {
                  _id: "valay_ark_2",
                  name: "JP Nagar Valay",
                  milans: [
                    "Satyaganapathi Milan",
                    "Chinmaya Milan",
                    "Narayana e-Techno Milan",
                  ],
                },
                {
                  _id: "valay_ark_3",
                  name: "Gottigere Valay",
                  milans: [
                    "Tejaswini Nagar Milan",
                    "Gottiger Milan",
                    "Akshay Nagar Milan",
                  ],
                },
                {
                  _id: "valay_ark_4",
                  name: "Bilekahalli Valay",
                  milans: [
                    "Bilekahalli Milan",
                    "Kodichikanahalli Milan",
                    "Hulimavu Milan",
                    "Royal Shelters Milan",
                  ],
                },
                {
                  _id: "valay_ark_5",
                  name: "Narayan Nagar Valay",
                  milans: ["Narayan Nagar Milan", "LBS Milan", "HVR Milan"],
                },
              ],
            },
            {
              _id: "khanda_chn",
              name: "Chandapura Khanda",
              code: "CHN",
              valays: [
                {
                  _id: "valay_chn_1",
                  name: "EC1 Valay",
                  milans: [
                    "EC1 Milan",
                    "Neeladri Nagar Milan",
                    "Doddathuguru Milan",
                    "Basapura Milan",
                    "MuthurayaSwamy Milan",
                    "Madhav Yuva Milan",
                  ],
                },
                {
                  _id: "valay_chn_2",
                  name: "EC2 Valay",
                  milans: ["EC2 Milan", "Anantnagar Milan", "Shantipura Milan"],
                },
                {
                  _id: "valay_chn_3",
                  name: "Chandapura Valay",
                  milans: [
                    "Chandapura Milan",
                    "Atteebele Milan",
                    "VBHC Apartment Milan",
                  ],
                },
                {
                  _id: "valay_chn_4",
                  name: "Bommasandra Valay",
                  milans: [
                    "Neo Town Milan",
                    "DLF Woodland Hights Apartment Milan",
                    "DLF Maiden Hights Apartment Milan",
                  ],
                },
                {
                  _id: "valay_chn_5",
                  name: "Bommanahalli Valay",
                  milans: [
                    "Begur Milan",
                    "Bommanahalli Milan",
                    "Roopena Agarahara Milan",
                    "Singasandra Milan",
                  ],
                },
              ],
            },
            {
              _id: "khanda_vrt",
              name: "Varthur Khanda",
              code: "VRT",
              valays: [
                {
                  _id: "valay_vrt_1",
                  name: "Panathur Valay",
                  milans: [
                    "Kadubeesanahalli Milan",
                    "Doddakanneli Milan",
                    "Carmelaram Milan",
                    "Temple Milan",
                    "GGL Layout Milan",
                  ],
                },
                {
                  _id: "valay_vrt_2",
                  name: "Gunjur Valay",
                  milans: [
                    "Balegere Milan",
                    "Gunjur Milan",
                    "Eco life Milan",
                    "Shobha dream acres Milan",
                  ],
                },
                {
                  _id: "valay_vrt_3",
                  name: "Dommasandara Valay",
                  milans: [
                    "Dommasandra Milan",
                    "Sarjapura Milan",
                    "Trinity Complex Milan",
                  ],
                },
                {
                  _id: "valay_vrt_4",
                  name: "Kaikondarahalli Valay",
                  milans: [
                    "KKH Lake Milan",
                    "Kasvanahalli Milan",
                    "Haralur Milan",
                  ],
                },
                {
                  _id: "valay_vrt_5",
                  name: "HSR Valay",
                  milans: [
                    "HSR Sec2 Milan",
                    "Agara Milan",
                    "HSR Sector 6 New Milan",
                    "ITI Layout Milan",
                    "Yuva Milan",
                  ],
                },
                {
                  _id: "valay_vrt_6",
                  name: "Hosa Road Valay",
                  milans: [
                    "Hosa Road Milan",
                    "Kudlu Milan",
                    "Nagnathpura Milan",
                  ],
                },
              ],
            },
            {
              _id: "khanda_kgp",
              name: "Kaggadaspura Khanda",
              code: "KGP",
              valays: [
                {
                  _id: "valay_kgp_1",
                  name: "Kaggadaspura Valay",
                  milans: [
                    "Kaggadaspura Milan",
                    "Byrasandra Milan",
                    "Malleshpalya Milan",
                    "Vignannagar Milan",
                  ],
                },
                {
                  _id: "valay_kgp_2",
                  name: "Kundalahalli Valay",
                  milans: [
                    "AECS Layout Milan",
                    "Chinnapanahalli Milan",
                    "BEML Layout Milan",
                  ],
                },
                {
                  _id: "valay_kgp_3",
                  name: "LBS Nagar Valay",
                  milans: [
                    "LBS Nagar Milan",
                    "Basava Nagar Milan",
                    "GM palya Milan",
                    "Yemalur Milan",
                  ],
                },
                {
                  _id: "valay_kgp_4",
                  name: "Pai Layout Valay",
                  milans: [
                    "B Narayanpura Milan",
                    "Karthik Nagar Milan",
                    "Pai Layout Milan",
                  ],
                },
                {
                  _id: "valay_kgp_5",
                  name: "Munnekolalu Valay",
                  milans: [
                    "Vagdevi vilas Milan",
                    "Sai Baba Milan",
                    "Marathahalli Milan",
                  ],
                },
              ],
            },
            {
              _id: "khanda_whf",
              name: "Whitefield Khanda",
              code: "WHF",
              valays: [
                {
                  _id: "valay_whf_1",
                  name: "Whitefield Valay",
                  milans: [
                    "Whitefield Milan",
                    "Nellurhalli Milan",
                    "ITPL Milan",
                  ],
                },
                {
                  _id: "valay_whf_2",
                  name: "Hoodi Valay",
                  milans: [
                    "Mahadevpura Milan",
                    "Hoodi Milan",
                    "Seetharampalya Milan",
                  ],
                },
                {
                  _id: "valay_whf_3",
                  name: "Chanasandra Valay",
                  milans: [
                    "Maithri layout Milan",
                    "Imadihalli Milan",
                    "Ambedkar Nagar Milan",
                  ],
                },
                {
                  _id: "valay_whf_4",
                  name: "Seegehalli Valay",
                  milans: [
                    "Seegehalli Milan",
                    "Kannamangala Milan",
                    "Doddabanhalli Milan",
                  ],
                },
                {
                  _id: "valay_whf_5",
                  name: "Kadugodi Valay",
                  milans: [
                    "Kadugodi Milan",
                    "Belathur Milan",
                    "Domasandra Milan",
                  ],
                },
              ],
            },
          ],
        },
      ];

      await Organization.insertMany(initialData);
      return NextResponse.json({ organizations: initialData });
    }

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error("Organization fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization data" },
      { status: 500 }
    );
  }
}
