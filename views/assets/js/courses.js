const getCategories = async () => {

  try{
    const res = await fetch("https://smart-antenna-django-backend.onrender.com/api/categories/");
    const categories = await res.json();
    console.log("Fetched categories:", categories);

    const categoriesContainer = document.querySelector(".courses-list");



      categories.forEach((category) => {
        categoriesContainer.innerHTML += `
          <button class="course-item" data-course="${category.category_name}">
            ${category.category_name}
          </button>
        `;
      });
    

  }catch(error) {
    console.log(error);

  }
} 

const courseRun = async () => {
  try {
    const res = await fetch("/coursesInfo");

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const  coursesData  = await res.json();

    console.log("Fetched courses:", coursesData);

    const filterState = {
      selectedCourses: [],
      selectedSkills: [],
      selectedDurations: [],
    };

    function init() {
      setupEventListeners();
      renderCourses(coursesData);
    }

    function setupEventListeners() {
      document.querySelectorAll(".course-item").forEach((btn) => {
        btn.addEventListener("click", handleCourseFilter);
      });

      document.querySelectorAll(".skill-filter").forEach((checkbox) => {
        checkbox.addEventListener("change", handleSkillFilter);
      });

      document.querySelectorAll(".duration-filter").forEach((checkbox) => {
        checkbox.addEventListener("change", handleDurationFilter);
      });
    }

    function handleCourseFilter(e) {
      const category = e.target.dataset.course;
      e.target.classList.toggle("is-active");

      if (filterState.selectedCourses.includes(category)) {
        filterState.selectedCourses =
          filterState.selectedCourses.filter((c) => c !== category);
      } else {
        filterState.selectedCourses.push(category);
      }

      applyFilters();
    }

    function handleSkillFilter(e) {
      const skill = e.target.value.toLowerCase();

      if (e.target.checked) {
        filterState.selectedSkills.push(skill);
      } else {
        filterState.selectedSkills =
          filterState.selectedSkills.filter((s) => s !== skill);
      }

      applyFilters();
    }

    function handleDurationFilter(e) {
      const duration = e.target.value;

      if (e.target.checked) {
        filterState.selectedDurations.push(duration);
      } else {
        filterState.selectedDurations =
          filterState.selectedDurations.filter((d) => d !== duration);
      }

      applyFilters();
    }

    function applyFilters() {
      let filtered = [...coursesData];

      if (filterState.selectedCourses.length > 0) {
        filtered = filtered.filter((course) =>
          filterState.selectedCourses.includes(course.category_name)
        );
      }

      if (filterState.selectedSkills.length > 0) {
        filtered = filtered.filter((course) =>
          filterState.selectedSkills.includes(
            course.skill_level.toLowerCase()
          )
        );
      }

      if (filterState.selectedDurations.length > 0) {
        filtered = filtered.filter((course) =>
          filterState.selectedDurations.includes(String(course.duration))
        );
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
            <p class="courses-empty__text">
              No courses found.
            </p>
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
        <img
          class="course-card__image"
          src="${course.image}"
          alt="${course.course_name}"
        />

        <div class="course-card__content">

          <h3 class="course-card__title">
            ${course.course_name}
          </h3>

          <p class="course-card__description">
            ${course.course_description}
          </p>

          <div class="course-card__meta">
            <span class="course-card__badge">
              ${course.skill_level}
            </span>

            <span class="course-card__badge">
              ${course.duration} Hours
            </span>
          </div>

          <button
            class="course-card__cta"
            data-course-id="${course.id}">
            View Course
          </button>

        </div>
      `;

      card
        .querySelector(".course-card__cta")
        .addEventListener("click", () => {
          console.log("Course clicked:", course);
          // window.location.href = `/course/${course.id}`;
        });

      return card;
    }

        function createCourseCard(course) {
      const card = document.createElement("div");

      card.className = "course-card";

      card.innerHTML = `
        <img
          class="course-card__image"
          src="${course.image}"
          alt="${course.course_name}"
        />

        <div class="course-card__content">

          <h3 class="course-card__title">
            ${course.course_name}
          </h3>

          <p class="course-card__description">
            ${course.course_description}
          </p>

          <div class="course-card__meta">
            <span class="course-card__badge">
              ${course.skill_level}
            </span>

            <span class="course-card__badge">
              ${course.duration} Hours
            </span>
          </div>

          <button
            class="course-card__cta"
            data-course-id="${course.id}">
            View Course
          </button>

        </div>
      `;

      card
        .querySelector(".course-card__cta")
        .addEventListener("click", () => {
          console.log("Course clicked:", course);
          // window.location.href = `/course/${course.id}`;
        });

      return card;
    }

    init();
  } catch (err) {
    console.error(err);

    document.getElementById("coursesGrid").innerHTML = `
      <div class="courses-empty">
        <p>Failed to load courses.</p>
      </div>
    `;
  }
};



courseRun();
getCategories();
