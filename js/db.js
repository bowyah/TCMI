// db.js — data store and refresh logic
window.DB = window.DB || {
  team: [], cofounder: {}, courses: [], events: [], users: {}, applications: [],
  faculty: [], students: [], lessons: [], assignments: [], exams: [], grades: [],
  announcements: [], messages: {}, enrollments: [], paymentMethods: {},
  eventRegistrations: [], pendingCourses: [], mediaItems: [], chatWith: null, notifications: [],
  books: [], sponsors: [], gallery: [], testimonials: []
};

window.refreshDB = async function () {
  try {
    const api = window.TCMI_API;
    const [team, cofounder, courses, events, gallery, testimonials, sponsors, books] = await Promise.all([
      api.public.getTeam().catch(() => []),
      api.public.getCofounder().catch(() => ({})),
      api.public.getCourses().catch(() => []),
      api.public.getEvents().catch(() => []),
      api.public.getGallery().catch(() => []),
      api.public.getTestimonials().catch(() => []),
      api.public.getSponsors().catch(() => []),
      api.public.getBooks().catch(() => [])
    ]);
    window.DB.team = team || [];
    window.DB.cofounder = cofounder || {};
    window.DB.courses = courses || [];
    window.DB.events = events || [];
    window.DB.gallery = gallery || [];
    window.DB.testimonials = testimonials || [];
    window.DB.sponsors = sponsors || [];
    window.DB.books = books || [];
  } catch (e) { console.error('DB Refresh Error:', e); }
};

if (typeof window !== 'undefined') window.DB = window.DB;
