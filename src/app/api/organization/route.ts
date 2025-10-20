// app/api/organization/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Organization from "@/models/Organization";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const organizations = await Organization.find({});

    console.log("Fetched organizations:", organizations.length);
    
    if (organizations.length === 0) {
      // Create a default organization if none exists
      const defaultOrg = new Organization({
        _id: 'org_1',
        name: 'Sangha Organization',
        khandas: []
      });
      await defaultOrg.save();
      
      return NextResponse.json({ 
        success: true,
        organizations: [defaultOrg] 
      });
    }

    // Process the data to ensure proper structure
    const processedOrganizations = organizations.map(org => {
      const orgObj = org.toObject ? org.toObject() : org;
      
      return {
        ...orgObj,
        khandas: (orgObj.khandas || []).map((khanda: any) => ({
          _id: khanda._id || `khanda_${Date.now()}`,
          name: khanda.name || 'Unnamed Khanda',
          code: khanda.code || 'K1',
          valays: (khanda.valays || []).map((valay: any) => ({
            _id: valay._id || `valay_${Date.now()}`,
            name: valay.name || 'Unnamed Valay',
            milans: (valay.milans || []).map((milan: any, index: number) => {
              // Handle the case where milan is an object with character properties
              if (typeof milan === 'object' && milan !== null && !Array.isArray(milan)) {
                // Check if it has the problematic structure with numbered keys
                const hasNumberedKeys = Object.keys(milan).some(key => !isNaN(parseInt(key)));
                
                if (hasNumberedKeys) {
                  // Reconstruct the string from character properties
                  const chars = Object.keys(milan)
                    .filter(key => !isNaN(parseInt(key)))
                    .sort((a, b) => parseInt(a) - parseInt(b))
                    .map(key => milan[key]);
                  
                  const reconstructedName = chars.join('');
                  
                  return {
                    _id: `milan_${valay._id}_${index}`,
                    name: reconstructedName,
                    ghatas: milan.ghatas || []
                  };
                }
                
                // If it's a proper object
                return {
                  _id: milan._id || `milan_${Date.now()}_${index}`,
                  name: milan.name || 'Unnamed Milan',
                  ghatas: milan.ghatas || []
                };
              }
              
              // Handle string milans
              if (typeof milan === 'string') {
                return {
                  _id: `milan_${valay._id}_${index}`,
                  name: milan,
                  ghatas: []
                };
              }
              
              // Default fallback
              return {
                _id: `milan_${Date.now()}_${index}`,
                name: 'Unnamed Milan',
                ghatas: []
              };
            })
          }))
        }))
      };
    });

    return NextResponse.json({ 
      success: true,
      organizations: processedOrganizations 
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

// PUT endpoint to update organization
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { _id, name, khandas } = body;

    console.log("Updating organization:", { _id, name, khandas: khandas?.length });

    if (!_id) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Clean and validate the data before saving
    const cleanedKhandas = (khandas || []).map((khanda: any) => ({
      _id: khanda._id || `khanda_${Date.now()}`,
      name: khanda.name || 'Unnamed Khanda',
      code: khanda.code || 'K1',
      valays: (khanda.valays || []).map((valay: any) => ({
        _id: valay._id || `valay_${Date.now()}`,
        name: valay.name || 'Unnamed Valay',
        milans: (valay.milans || []).map((milan: any) => ({
          _id: milan._id || `milan_${Date.now()}`,
          name: milan.name || 'Unnamed Milan',
          ghatas: (milan.ghatas || []).map((ghata: any) => ({
            _id: ghata._id || `ghata_${Date.now()}`,
            name: ghata.name || 'New Ghata'
          }))
        }))
      }))
    }));

    const updatedOrganization = await Organization.findByIdAndUpdate(
      _id,
      { 
        name: name || 'Sangha Organization',
        khandas: cleanedKhandas
      },
      { 
        new: true, 
        runValidators: true,
        upsert: true // Create if doesn't exist
      }
    );

    if (!updatedOrganization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    console.log("Successfully updated organization");

    return NextResponse.json({
      success: true,
      organization: updatedOrganization
    });

  } catch (error: any) {
    console.error("Organization update error:", error);
    return NextResponse.json(
      { error: `Failed to update organization: ${error.message}` },
      { status: 500 }
    );
  }
}