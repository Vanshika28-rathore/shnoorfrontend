const STORAGE_KEY = 'shnoor_courses';
const INITIAL_COURSES = [
    { id: 1, name: 'Intro to Python', count: 12, duration: 120, progress: 0, hasCertificate: true, description: 'Learn Python from scratch' },
    { id: 2, name: 'React Fundamentals', count: 8, duration: 200, progress: 0, hasCertificate: true, description: 'Master React.js concepts' },
    { id: 3, name: 'Advanced CSS', count: 5, duration: 60, progress: 0, hasCertificate: false, description: 'Deep dive into CSS Grid and Flexbox' },
    { id: 4, name: 'Node.js Basics', count: 10, duration: 150, progress: 0, hasCertificate: true, description: 'Server-side JavaScript' },
];
export const getCourses = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COURSES));
        return INITIAL_COURSES;
    }
    return JSON.parse(stored);
};
export const saveCourses = (courses) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    window.dispatchEvent(new Event('coursesUpdated'));
};
export const addCourse = (name) => {
    const courses = getCourses();
    const newCourse = {
        id: Date.now(),
        name,
        count: 0,
        duration: 0,
        progress: 0,
        hasCertificate: false,
        description: 'New Course'
    };
    const updated = [...courses, newCourse];
    saveCourses(updated);
    return updated;
};
export const deleteCourse = (id) => {
    const courses = getCourses();
    const updated = courses.filter(c => c.id !== id);
    saveCourses(updated);
    return updated;
};