import { google } from "googleapis";

/**
 * Google Calendar integrace pro Reality Follow-up AI.
 * Automaticky vytváří schůzky v Google Calendar.
 */

interface CreateEventParams {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendeeEmail?: string;
  location?: string;
}

/**
 * Vytvoří novou schůzku v Google Calendar.
 * Vyžaduje OAuth token uživatele.
 */
export async function createCalendarEvent(
  accessToken: string,
  params: CreateEventParams
): Promise<{ eventId: string; eventUrl: string }> {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
      summary: params.title,
      description: params.description,
      start: {
        dateTime: params.startTime.toISOString(),
        timeZone: "Europe/Prague", // Česká časová zóna
      },
      end: {
        dateTime: params.endTime.toISOString(),
        timeZone: "Europe/Prague",
      },
      location: params.location,
      attendees: params.attendeeEmail
        ? [{ email: params.attendeeEmail }]
        : undefined,
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 24 hodin před
          { method: "popup", minutes: 30 }, // 30 minut před
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    return {
      eventId: response.data.id || "",
      eventUrl: response.data.htmlLink || "",
    };
  } catch (error) {
    console.error("Google Calendar error:", error);
    throw new Error(`Failed to create calendar event: ${error}`);
  }
}

/**
 * Vytvoří schůzku v Google Calendar pro nový lead.
 * Schůzka je naplánována na příští den v 10:00.
 */
export async function createMeetingForLead(
  accessToken: string,
  leadName: string,
  leadEmail: string,
  propertyInfo: string
): Promise<{ eventId: string; eventUrl: string } | null> {
  try {
    // Naplánujeme schůzku na příští den v 10:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const endTime = new Date(tomorrow);
    endTime.setHours(11, 0, 0, 0); // 1 hodina

    const event = await createCalendarEvent(accessToken, {
      title: `Schůzka: ${leadName}`,
      description: `Realitní poptávka: ${propertyInfo}\n\nKontakt: ${leadEmail}`,
      startTime: tomorrow,
      endTime: endTime,
      attendeeEmail: leadEmail,
      location: "Online / Domluvit se",
    });

    return event;
  } catch (error) {
    console.error("Failed to create meeting for lead:", error);
    return null;
  }
}

/**
 * Aktualizuje existující schůzku v Google Calendar.
 */
export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  params: Partial<CreateEventParams>
): Promise<boolean> {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event: any = {};

    if (params.title) event.summary = params.title;
    if (params.description) event.description = params.description;
    if (params.startTime) {
      event.start = {
        dateTime: params.startTime.toISOString(),
        timeZone: "Europe/Prague",
      };
    }
    if (params.endTime) {
      event.end = {
        dateTime: params.endTime.toISOString(),
        timeZone: "Europe/Prague",
      };
    }
    if (params.location) event.location = params.location;

    await calendar.events.update({
      calendarId: "primary",
      eventId: eventId,
      requestBody: event,
    });

    return true;
  } catch (error) {
    console.error("Failed to update calendar event:", error);
    return false;
  }
}

/**
 * Smaže schůzku z Google Calendar.
 */
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<boolean> {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });

    return true;
  } catch (error) {
    console.error("Failed to delete calendar event:", error);
    return false;
  }
}
