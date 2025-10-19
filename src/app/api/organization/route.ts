import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Organization from "@/models/Organization";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const organizations = await Organization.find();

    if (organizations.length === 0) {
      const initialData = [
        {
          _id: "vibhaaga_001",
          name: "Bengaluru Dakshin",
          khandas: [
            {
              _id: "khanda_vjn",
              name: "Vijayanagara",
              code: "VJN",
              valays: [
                {
                  _id: "valay_vjn_1",
                  name: "Visheshwariah Nagara",
                  milans: ["Bharatnagara", "Annapurneshwarinagara"]
                },
                {
                  _id: "valay_vjn_2",
                  name: "Nagarabhavi",
                  milans: ["Nagarabhavi", "Jnanabharati", "Chandra Layout"]
                },
                {
                  _id: "valay_vjn_3",
                  name: "Govindarajanagara",
                  milans: ["Kalyananagara", "MC Layout", "Saraswatinagara"]
                },
                {
                  _id: "valay_vjn_4",
                  name: "Kengeri",
                  milans: ["Doddabele", "Kumbalagodu", "Bandematha"]
                },
                {
                  _id: "valay_vjn_5",
                  name: "Vijayanagara",
                  milans: ["Vijayanagara", "Hampinagara", "Attiguppe"]
                }
              ]
            },
            {
              _id: "khanda_skpm",
              name: "Shankarapuram",
              code: "SKPM",
              valays: [
                {
                  _id: "valay_skpm_1",
                  name: "Shankarapuram",
                  milans: ["Banashankari", "Chennamanakere Achukattu", "Girinagar", "Basavanagudi", "Hanumanthanagar"]
                }
              ]
            },
            {
              _id: "khanda_bsk",
              name: "Banashankari",
              code: "BSK",
              valays: [
                {
                  _id: "valay_bsk_1",
                  name: "Srinivasapura",
                  milans: ["Srinivasapura", "Vijayashree Layout", "Hemmigepura", "Kodipalya", "Krishna Garden"]
                },
                {
                  _id: "valay_bsk_2",
                  name: "Rajarajeshwari Nagara",
                  milans: ["Rajarajeshwari", "Sacchidananda Nagar", "Kenchanahalli", "Poornapragna"]
                },
                {
                  _id: "valay_bsk_3",
                  name: "Vasantapura",
                  milans: ["Gubbalala", "Reshme Nagar", "Gokulam", "Pavamanapura", "Turahalli", "Vasanta Vallabha Nagara"]
                },
                {
                  _id: "valay_bsk_4",
                  name: "Banashankari",
                  milans: ["Chikkalasandra", "Yelachenahalli", "Kathriguppe", "Kumaraswamy Layout"]
                }
              ]
            },
            {
              _id: "khanda_btm",
              name: "BTM",
              code: "BTM",
              valays: [
                {
                  _id: "valay_btm_1",
                  name: "Jayanagara",
                  milans: ["Ragigudda", "JP Nagar Phase 1", "Jayanagar", "Yediyur"]
                },
                {
                  _id: "valay_btm_2",
                  name: "BTM",
                  milans: ["SG Palya", "Maruti Nagar", "BTM", "Shri Ram"]
                },
                {
                  _id: "valay_btm_3",
                  name: "Koramangala",
                  milans: ["Koramangala", "Venkatapura", "ST Bed"]
                }
              ]
            },
            {
              _id: "khanda_ark",
              name: "Arakere",
              code: "ARK",
              valays: [
                {
                  _id: "valay_ark_1",
                  name: "Gottigere",
                  milans: ["Akshay Nagar", "Tejaswini Nagar", "Gottigere"]
                },
                {
                  _id: "valay_ark_2",
                  name: "Billekahalli",
                  milans: ["Hulimavu", "Royal Shelters", "Bilekahalli", "Kodichikanahalli"]
                },
                {
                  _id: "valay_ark_3",
                  name: "JP Nagara",
                  milans: ["Narayana e-Techno", "Satyaganapathi", "Chinmaya"]
                },
                {
                  _id: "valay_ark_4",
                  name: "Narayana Nagara",
                  milans: ["HVR", "Narayan Nagar", "LBS"]
                },
                {
                  _id: "valay_ark_5",
                  name: "Puttenahalli",
                  milans: ["Jambusavari Dinne", "Arekere", "Puttenahalli"]
                }
              ]
            },
            {
              _id: "khanda_chn",
              name: "Chandapura",
              code: "CHN",
              valays: [
                {
                  _id: "valay_chn_1",
                  name: "EC1",
                  milans: ["Basapura", "Neeladri Nagar", "Doddathuguru", "MuthurayaSwamy", "EC1", "Madhav yuva", "Chikkathogur"]
                },
                {
                  _id: "valay_chn_2",
                  name: "EC2",
                  milans: ["Shantipura", "EC2", "Anantnagar"]
                },
                {
                  _id: "valay_chn_3",
                  name: "Chandapura",
                  milans: ["Atteebele", "VBHC Apartment", "Chandapura"]
                },
                {
                  _id: "valay_chn_4",
                  name: "Bommasandra",
                  milans: ["DLF Maiden Heights Apartment", "Neo Town", "DLF Woodland Heights Apartment"]
                },
                {
                  _id: "valay_chn_5",
                  name: "Bommanahalli",
                  milans: ["Singasandra", "Roopena Agrahara", "Begur", "Bommanahalli"]
                }
              ]
            },
            {
              _id: "khanda_vrt",
              name: "Varthur",
              code: "VRT",
              valays: [
                {
                  _id: "valay_vrt_1",
                  name: "Gunjur",
                  milans: ["Balegere", "Shobha Dream Acres", "Eco Life", "Gunjur", "Laharia Apartment"]
                },
                {
                  _id: "valay_vrt_2",
                  name: "HSR",
                  milans: ["ITI Layout", "Yuva", "HSR Sector 6", "HSR Sector 2", "Agara"]
                },
                {
                  _id: "valay_vrt_3",
                  name: "Hosa Road",
                  milans: ["Hosa Road", "Kudlu", "Nagnathpura"]
                },
                {
                  _id: "valay_vrt_4",
                  name: "Kaikondarahalli",
                  milans: ["KKH Lake", "Kasvanahalli", "Haralur"]
                },
                {
                  _id: "valay_vrt_5",
                  name: "Dommasandra",
                  milans: ["Dommasandra", "Sarjapura", "Trinity Complex"]
                },
                {
                  _id: "valay_vrt_6",
                  name: "Panathur",
                  milans: ["Kadubeesanahalli", "Doddakanneli", "Carmelaram", "Temple", "GGL Layout"]
                }
              ]
            },
            {
              _id: "khanda_kgp",
              name: "Kaggadasapura",
              code: "KGP",
              valays: [
                {
                  _id: "valay_kgp_1",
                  name: "Kaggadaspura",
                  milans: ["Kaggadaspura", "Byrasandra", "Malleshpalya", "Vignannagar"]
                },
                {
                  _id: "valay_kgp_2",
                  name: "Kundalahalli",
                  milans: ["AECS Layout", "Chinnapanahalli", "BEML Layout"]
                },
                {
                  _id: "valay_kgp_3",
                  name: "LBS Nagar",
                  milans: ["LBS Nagar", "Basava Nagar", "GM palya", "Yemalur"]
                },
                {
                  _id: "valay_kgp_4",
                  name: "Pai Layout",
                  milans: ["B Narayanpura", "Karthik Nagar", "Pai Layout"]
                },
                {
                  _id: "valay_kgp_5",
                  name: "Munnekolalu",
                  milans: ["Vagdevi vilas", "Sai Baba", "Marathahalli"]
                }
              ]
            },
            {
              _id: "khanda_whf",
              name: "Whitefield",
              code: "WHF",
              valays: [
                {
                  _id: "valay_whf_1",
                  name: "Whitefield",
                  milans: ["Whitefield", "Nellurhalli", "ITPL"]
                },
                {
                  _id: "valay_whf_2",
                  name: "Hoodi",
                  milans: ["Mahadevpura", "Hoodi", "Seetharampalya"]
                },
                {
                  _id: "valay_whf_3",
                  name: "Chanasandra",
                  milans: ["Maithri layout", "Imadihalli", "Ambedkar Nagar"]
                },
                {
                  _id: "valay_whf_4",
                  name: "Seegehalli",
                  milans: ["Seegehalli", "Kannamangala", "Doddabanhalli"]
                },
                {
                  _id: "valay_whf_5",
                  name: "Kadugodi",
                  milans: ["Kadugodi", "Belathur", "Domasandra"]
                }
              ]
            }
          ]
        }
      ];
      await Organization.insertMany(initialData);
      return NextResponse.json({ 
        success: true,
        organizations: initialData 
      });
    }

    return NextResponse.json({ 
      success: true,
      organizations 
    });
  } catch (error) {
    console.error("Organization fetch error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch organization data" 
      },
      { status: 500 }
    );
  }
}

// POST endpoint to create new organization structure
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { name, khandas } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );
    }

    const organization = new Organization({
      name,
      khandas: khandas || []
    });

    await organization.save();

    return NextResponse.json({
      success: true,
      organization
    }, { status: 201 });

  } catch (error) {
    console.error("Organization creation error:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}