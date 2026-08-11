/* =========================================================
   COURSE DETAIL PAGE - JAVASCRIPT
   ========================================================= */

(async function () {
  "use strict";

  const url = new URL(window.location.href);
  const courseID = url.searchParams.get("id");
  let lecturesData = [];

  // =========================================================
  // INITIALIZATION
  // =========================================================

  async function init() {
    // Wait for DOM to be fully ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", loadAndRenderCourse);
    } else {
      await loadAndRenderCourse();
    }
  }

  async function loadAndRenderCourse() {
    const title = document.getElementById("course-title");

    if (!courseID) {
      title.textContent = "Course not found";
      return;
    }

    try {
      const coursesRes = await fetch("/coursesInfo");
      if (!coursesRes.ok) {
        throw new Error(`HTTP Error! Status: ${coursesRes.status}`);
      }

      const coursesData = await coursesRes.json();
      const course = coursesData.find((item) => String(item.id) === courseID);
      if (!course) {
        throw new Error(`Course with ID ${courseID} not found`);
      }

      populateCourseDetails(course);
      await loadLectures();
      renderPage();
    } catch (error) {
      console.error("Error fetching course data:", error);
      title.textContent = "Course not found";
      document.getElementById("course-description").textContent =
        "We could not load this course. Please return to the courses page and try again.";
    }
  }

  async function loadLectures() {
    const lecturesRes = await fetch("/lecturesInfo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseID }),
    });

    if (!lecturesRes.ok) {
      throw new Error(`Unable to load lectures: ${lecturesRes.status}`);
    }

    const data = await lecturesRes.json();
    lecturesData = Array.isArray(data) ? data : [];
  }

  function populateCourseDetails(course) {
    const lecturer = course.lecturer || {};
    const lecturerName = [lecturer.first_name, lecturer.last_name]
      .filter(Boolean)
      .join(" ") || lecturer.username || "Course instructor";

    document.title = `${course.course_name} — Smart Antenna`;
    document.getElementById("course-title").textContent = course.course_name;
    document.getElementById("course-category").textContent = course.category_name || "";
    document.getElementById("course-description").textContent = course.course_description || "No description available.";
    document.getElementById("course-lecture-count").textContent = `${course.number_of_lectures || 0} Lectures`;
    document.getElementById("course-skill-level").textContent = course.skill_level || "—";
    document.getElementById("course-category-info").textContent = course.category_name || "—";
    document.getElementById("lecturer-name").textContent = lecturerName;
    document.getElementById("lecturer-email").textContent = lecturer.email || "";
    document.getElementById("lecturer-bio").textContent = lecturer.username
      ? `Instructor: ${lecturer.username}`
      : "";

    const image = document.getElementById("course-image");
    image.src = course.image || "";
    image.alt = `${course.course_name} course image`;
  }

  function renderPage() {
    renderCurriculum();
    setupMeetingEmbeds();
    setupAccordion();
    setupEnrollmentScroll();
    setupAnimations();
  }

  // =========================================================
  // RENDER CURRICULUM
  // =========================================================

  function renderCurriculum() {
    const container = document.querySelector(".curriculum-accordion");
    if (!container) return;

    if (!lecturesData.length) {
      container.innerHTML = '<p class="course-about__paragraph">No lectures are available for this course yet.</p>';
      return;
    }

    container.innerHTML = lecturesData.map((lecture) => createCurriculumModule(lecture)).join("");
  }

  function createCurriculumModule(lecture) {
    // Build lesson items based on available resources
    const lessonItems = buildLessonItems(lecture);

    return `
      <div class="accordion-module" data-lecture-id="${lecture.lecture_number}">
        <button class="accordion-header" data-lecture-id="${lecture.lecture_number}">
          <span class="accordion-header__title">
            <span class="accordion-header__icon">${lecture.lecture_number}</span>
            <span>${escapeHtml(lecture.lecture_name || `Lecture ${lecture.lecture_number}`)}</span>
          </span>
          <span class="accordion-toggle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </button>
        <div class="accordion-content">
          <div class="accordion-lessons">
            ${lessonItems}
          </div>
        </div>
      </div>
    `;
  }

  function buildLessonItems(lecture) {
    let items = "";

    if (lecture.lecture_description) {
      items += `
        <p class="lesson-item__text">${escapeHtml(lecture.lecture_description)}</p>
      `;
    }

    // PDF file
    if (lecture.pdf_file) {
      items += `
        <a href="${lecture.pdf_file}" class="lesson-item" download title="Download lecture PDF">
          <svg class="lesson-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <span class="lesson-item__text">Lecture Slides (PDF)</span>
        </a>
      `;
    }

    // Meeting link
    if (lecture.meeting_link) {
      const meetingUrl = getSafeUrl(lecture.meeting_link);

      if (meetingUrl) {
      items += `
        <div class="lecture-meeting">
          <button
            type="button"
            class="lecture-meeting__button"
            data-meeting-url="${escapeHtml(meetingUrl)}"
            data-lecture-number="${lecture.lecture_number}"
          >
            Join Meeting
          </button>
          <div class="lecture-meeting__embed" hidden></div>
        </div>
      `;
      }
    }

    // Fallback if no resources
    if (!lecture.pdf_file && !lecture.meeting_link && !lecture.lecture_description) {
      items += `
        <div class="lesson-item" style="cursor: default; opacity: 0.6;">
          <span class="lesson-item__text">No resources available yet</span>
        </div>
      `;
    }

    return items;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    })[character]);
  }

  function getSafeUrl(value) {
    try {
      const url = new URL(value);
      return ["https:", "http:"].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  }

  function setupMeetingEmbeds() {
    document.querySelectorAll(".lecture-meeting__button").forEach((button) => {
      button.addEventListener("click", () => {
        const embed = button.nextElementSibling;
        if (!embed.dataset.loaded) {
          const frame = document.createElement("iframe");
          frame.className = "lecture-meeting__frame";
          frame.src = button.dataset.meetingUrl;
          frame.title = `Lecture ${button.dataset.lectureNumber} meeting`;
          frame.allow = "camera; microphone; fullscreen; display-capture";
          frame.allowFullscreen = true;

          const fallback = document.createElement("a");
          fallback.className = "lecture-meeting__fallback";
          fallback.href = button.dataset.meetingUrl;
          fallback.target = "_blank";
          fallback.rel = "noopener noreferrer";
          fallback.textContent = "Open meeting in a new tab";

          embed.append(frame, fallback);
          embed.dataset.loaded = "true";
        }

        embed.hidden = !embed.hidden;
        button.textContent = embed.hidden ? "Join Meeting" : "Hide Meeting";

        requestAnimationFrame(() => {
          const content = button.closest(".accordion-content");
          content.style.maxHeight = `${content.scrollHeight}px`;
        });
      });
    });
  }

  // =========================================================
  // ACCORDION FUNCTIONALITY
  // =========================================================

  function setupAccordion() {
    const headers = document.querySelectorAll(".accordion-header");

    headers.forEach((header) => {
      header.addEventListener("click", function () {
        const module = this.closest(".accordion-module");
        toggleModule(module);
      });
    });
  }

  function toggleModule(module) {
    const isOpen = module.classList.toggle("is-open");
    const content = module.querySelector(".accordion-content");

    if (isOpen) {
      content.style.maxHeight = content.scrollHeight + "px";
    } else {
      content.style.maxHeight = "0px";
    }
  }

  // =========================================================
  // ENROLLMENT BUTTON SCROLL
  // =========================================================
function setupEnrollmentScroll() {
  const enrollNowBtn = document.getElementById("enroll-now");
  const enrollForBtn = document.getElementById("enroll-for");

  if (!enrollNowBtn || !enrollForBtn) {
    return;
  }

  enrollNowBtn.addEventListener("click", () => {
    enrollForBtn.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  });
}
  // =========================================================
  // ANIMATIONS WITH GSAP
  // =========================================================

  function setupAnimations() {
    // Check if GSAP is available
    if (typeof gsap === "undefined") {
      console.warn("GSAP not loaded, animations skipped");
      return;
    }

    // Hero section entrance
    gsap.from(".course-hero__title, .course-hero__description", {
      y: 15,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out"
    });

    gsap.from(".course-hero__cta-group", {
      y: 10,
      duration: 0.6,
      delay: 0.2,
      ease: "power2.out"
    });

    gsap.from(".course-hero__image-wrapper", {
      scale: 0.95,
      y: 20,
      duration: 0.6,
      delay: 0.1,
      ease: "power2.out"
    });

    // About section scroll animation
    gsap.from(".course-about__heading, .course-about__paragraph", {
      y: 15,
      duration: 0.5,
      stagger: 0.08,
      scrollTrigger: {
        trigger: ".course-about",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    gsap.from(".course-info-card", {
      x: 20,
      duration: 0.5,
      scrollTrigger: {
        trigger: ".course-about",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    // Curriculum modules animation
    gsap.from(".accordion-module", {
      y: 12,
      duration: 0.4,
      stagger: 0.06,
      scrollTrigger: {
        trigger: ".course-curriculum",
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });

    // Instructor section animation
    gsap.from(".instructor-card", {
      y: 15,
      duration: 0.5,
      scrollTrigger: {
        trigger: ".course-instructor",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });
  }

  // =========================================================
  // START
  // =========================================================

  init();
})();
