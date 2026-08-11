const courseRun = async () => {
  try {
    // 1. Fetch BOTH categories and courses in parallel to save time
    const [categoriesRes, coursesRes] = await Promise.all([
      fetch("/categories"),
      fetch("/coursesInfo"),
    ]);

    if (!coursesRes.ok) {
      throw new Error(`HTTP Error! Status: ${coursesRes.status}`);
    }

    const categories = await categoriesRes.json().catch(() => []);
    const coursesData = await coursesRes.json();

    console.log("Fetched categories:", categories);
    console.log("Fetched courses:", coursesData);

    // 2. Render categories FIRST before setting up event listeners
    const categoriesContainer = document.querySelector(".courses-list");
    if (categoriesContainer) {
      categoriesContainer.innerHTML = categories
        .map(
          (category) => `
        <button class="course-item" data-course="${category.category_name}">
          ${category.category_name}
        </button>
      `,
        )
        .join("");
    }

    const filterState = {
      selectedCourses: [],
      selectedSkills: [],
      selectedLectureCounts: [],
    };

    function init() {
      setupEventListeners();
      renderCourses(coursesData);
    }

    function setupEventListeners() {
      // These now reliably find the dynamically generated buttons!
      document.querySelectorAll(".course-item").forEach((btn) => {
        btn.addEventListener("click", handleCourseFilter);
      });

      document.querySelectorAll(".skill-filter").forEach((checkbox) => {
        checkbox.addEventListener("change", handleSkillFilter);
      });

      document.querySelectorAll(".lecture-count-filter").forEach((checkbox) => {
        checkbox.addEventListener("change", handleLectureCountFilter);
      });
    }

    function handleCourseFilter(e) {
      const category = e.target.dataset.course;
      e.target.classList.toggle("is-active");

      if (filterState.selectedCourses.includes(category)) {
        filterState.selectedCourses = filterState.selectedCourses.filter(
          (c) => c !== category,
        );
      } else {
        filterState.selectedCourses.push(category);
      }

      applyFilters();
    }

    function handleSkillFilter(e) {
      // NOTE: Ensure these match what your API gives you ("advanced", "intermediate", "beginner")
      // If your API returns "high"/"medium"/"low", change these mappings accordingly!
      const skill = e.target.value.toLowerCase();

      if (e.target.checked) {
        filterState.selectedSkills.push(skill);
      } else {
        filterState.selectedSkills = filterState.selectedSkills.filter(
          (s) => s !== skill,
        );
      }

      applyFilters();
    }

    function handleLectureCountFilter(e) {
      const lectureCountRange = e.target.value; // e.g., "1-10"

      if (e.target.checked) {
        filterState.selectedLectureCounts.push(lectureCountRange);
      } else {
        filterState.selectedLectureCounts = filterState.selectedLectureCounts.filter(
          (count) => count !== lectureCountRange,
        );
      }

      applyFilters();
    }

    function applyFilters() {
      let filtered = [...coursesData];

      // Category filter
      if (filterState.selectedCourses.length > 0) {
        filtered = filtered.filter((course) =>
          filterState.selectedCourses.includes(course.category_name),
        );
      }

      // Skill level filter
      if (filterState.selectedSkills.length > 0) {
        filtered = filtered.filter((course) => {
          const level = course.skill_level.toLowerCase();
          // Maps your HTML checkbox values ('high', 'medium', 'low') to legible skill descriptions
          return filterState.selectedSkills.some((selectedSkill) => {
            if (selectedSkill === "high" && level === "advanced") return true;
            if (selectedSkill === "medium" && level === "intermediate")
              return true;
            if (selectedSkill === "low" && level === "beginner") return true;
            return level === selectedSkill;
          });
        });
      }

      // Lecture count range filter
      if (filterState.selectedLectureCounts.length > 0) {
        filtered = filtered.filter((course) => {
          const lectureCount = Number(course.number_of_lectures);

          // Checks whether the course fits within any selected lecture range.
          return filterState.selectedLectureCounts.some((rangeStr) => {
            const [min, max] = rangeStr.split("-").map(Number);
            return lectureCount >= min && lectureCount <= max;
          });
        });
      }

      renderCourses(filtered);
    }

    function renderCourses(courses) {
      const grid = document.getElementById("coursesGrid");
      grid.innerHTML = "";

      if (!courses.length) {
        grid.innerHTML = `
          <div class="courses-empty">
            <div class="courses-empty__icon">📚</div>
            <p class="courses-empty__text">No courses found.</p>
          </div>
        `;
        return;
      }

      courses.forEach((course) => {
        grid.appendChild(createCourseCard(course));
      });
    }

    function createCourseCard(course) {
      const card = document.createElement("div");
      card.className = "course-card";
      card.innerHTML = `
        <img class="course-card__image" src="${course.image}" alt="${course.course_name}" />
        <div class="course-card__content">
          <h3 class="course-card__title">${course.course_name}</h3>
          <p class="course-card__description">${course.course_description}</p>
          <div class="course-card__meta">
            <span class="course-card__badge">${course.skill_level}</span>
            <span class="course-card__badge">${course.number_of_lectures} Lectures</span>
          </div>
          <button class="course-card__cta" data-course-id="${course.id}">View Course</button>
        </div>
      `;

      card.querySelector(".course-card__cta").addEventListener("click", () => {
        console.log("Course clicked:", course);
        window.location.href = `/course-detail?id=${encodeURIComponent(course.id)}`;
      });

      return card;
    }

    init();
  } catch (err) {
    console.error("Initialization error:", err);
    document.getElementById("coursesGrid").innerHTML = `
      <div class="courses-empty">
        <p>Failed to load courses.</p>
      </div>
    `;
  }
};

// Fire the master initiator function
courseRun();
