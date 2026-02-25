import { http, HttpResponse, delay } from "msw";
import { mockMeetingInfoWithUserSlots, mockMeetTimezones, mockMeetTimezonesSpecial } from "./mocks";

export const uid = "d6d85ef8-1673-4194-9069-598c7cf739dd";
export const timeZoneUid = "1893e8e1-0c70-4bc5-8be8-61acc0b06a61";
export const timeZoneSpecificUid = "0ed402e2-a03e-4598-9eee-6a7fc26b7d46";

export const meetHandlers = [
  http.post("https://termeet.tech/api/meet/create", async ({ request }) => {
    const requestBody = (await request.clone().json()) as { name: string; description: string };
    await delay(3000); // Симулируем задержку сети
    return HttpResponse.json(
      {
        ...requestBody,
        hash: timeZoneUid,
        slots: [],
      },
      { status: 201 },
    );
  }),

  http.get("https://termeet.tech/api/meet/:hash", async ({ params }) => {
    console.log("Received request for meeting info with hash:", params.hash);
    const { hash } = params;
    // await delay(2000); // Симулируем задержку сети
    if (hash == uid) {
      return HttpResponse.json(mockMeetingInfoWithUserSlots, { status: 200 });
    }
    if (hash == timeZoneUid) {
      return HttpResponse.json(mockMeetTimezones, { status: 200 });
    }
    if (hash == timeZoneSpecificUid) {
      return HttpResponse.json(mockMeetTimezonesSpecial, { status: 200 });
    }
    return HttpResponse.json({ message: "Meeting not found" }, { status: 404 });
  }),

  http.post("https://termeet.tech/api/meets/slots/:hash", async ({ params, request }) => {
    const { hash } = params;
    const requestBody = (await request.clone().json()) as { name: string; slots: string[][] };
    console.log("Received slots update for meeting", hash, "with data:", requestBody);
    await delay(3000); // Симулируем задержку сети
    return HttpResponse.json({ message: "Slots updated successfully" }, { status: 200 });
  }),
];
