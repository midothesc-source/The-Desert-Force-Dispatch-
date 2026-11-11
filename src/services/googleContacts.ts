import { Operative } from '../types/tactical';

export interface GoogleContactSummary {
  resourceName: string;
  name: string;
  email: string;
  phone: string;
  organization?: string;
  jobTitle?: string;
  notes?: string;
  photoUrl?: string;
}

/**
 * Lists contacts from Google People API.
 */
export async function fetchGoogleContacts(accessToken: string): Promise<GoogleContactSummary[]> {
  const url = 'https://people.googleapis.com/v1/people/me/connections?' + new URLSearchParams({
    pageSize: '100',
    personFields: 'names,emailAddresses,phoneNumbers,photos,organizations,biographies',
  });

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Contacts API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const connections = data.connections || [];

  return connections.map((c: any): GoogleContactSummary => {
    const displayName = c.names?.[0]?.displayName || 'Classified Contact';
    const email = c.emailAddresses?.[0]?.value || '';
    const phone = c.phoneNumbers?.[0]?.value || '';
    const organization = c.organizations?.[0]?.name || '';
    const jobTitle = c.organizations?.[0]?.title || '';
    const notes = c.biographies?.[0]?.value || '';
    const photoUrl = c.photos?.[0]?.url || '';

    return {
      resourceName: c.resourceName,
      name: displayName,
      email,
      phone,
      organization,
      jobTitle,
      notes,
      photoUrl,
    };
  });
}

/**
 * Pushes a Tactical Operative to Google Contacts via People API createContact.
 */
export async function pushOperativeToGoogleContacts(
  accessToken: string,
  operative: Operative
): Promise<{ resourceName: string }> {
  const url = 'https://people.googleapis.com/v1/people:createContact';

  const body = {
    names: [
      {
        givenName: operative.name,
        familyName: `[${operative.codename}]`,
      },
    ],
    emailAddresses: operative.email ? [{ value: operative.email, type: 'work' }] : [],
    phoneNumbers: operative.phone ? [{ value: operative.phone, type: 'mobile' }] : [],
    organizations: [
      {
        name: operative.organization || 'The Desert Force Command',
        title: `${operative.role} (${operative.faction})`,
        department: operative.clearanceLevel,
      },
    ],
    biographies: [
      {
        value: `[THE DESERT FORCE DISPATCH DOSSIER]\nCodename: ${operative.codename}\nFaction: ${operative.faction}\nAllegiance: ${operative.allegiance}\nClearance: ${operative.clearanceLevel}\nRelationship Health: ${operative.relationshipHealth}%\nDoctrine: Follow My Path Or Feel My Wrath.\nLore: ${operative.lore}`,
        contentType: 'TEXT_PLAIN',
      },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to push contact to Google: ${errorText}`);
  }

  const result = await response.json();
  return { resourceName: result.resourceName };
}

/**
 * Deletes a contact from Google Contacts (requires explicit user confirmation beforehand).
 */
export async function deleteGoogleContact(accessToken: string, resourceName: string): Promise<void> {
  const url = `https://people.googleapis.com/v1/${resourceName}:deleteContact`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to remove contact from Google: ${errorText}`);
  }
}
