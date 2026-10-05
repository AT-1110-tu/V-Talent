/* ================================================= */
/* SUPABASE */
/* ================================================= */

const SUPABASE_URL =
    "https://wiajsvsfopozfpmoblgy.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_z3WZQg-t1hAOvh4wkzypyg_9EMIsZO5";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


/* ================================================= */
/* DATA */
/* ================================================= */

const projects = {

    spidana: {
        category: "Truyền thông",
        title: "Tảo xoắn SpiDana",
        intro: "Cần hỗ trợ xây dựng nội dung, hình ảnh và truyền thông để tiếp cận khách hàng tốt hơn.",
        producer: "HTX Công nghệ Cao Mặt Trời Việt",
        location: "Sơn Trà, Đà Nẵng",
        duration: "Khoảng 2 tuần",
        problem: "Sản phẩm có chất lượng tốt nhưng hoạt động truyền thông và tiếp cận khách hàng còn hạn chế.",
        skills: [
            "Content",
            "Social Media",
            "Photography"
        ]
    },

    design: {
        category: "Thiết kế",
        title: "Nhận diện sản phẩm địa phương",
        intro: "Cần hỗ trợ thiết kế hình ảnh giới thiệu sản phẩm và bộ nhận diện cơ bản.",
        producer: "Hộ sản xuất địa phương",
        location: "Đà Nẵng",
        duration: "Khoảng 1 tháng",
        problem: "Sản phẩm đã có nhưng hình ảnh nhận diện chưa thống nhất, gây khó khăn trong việc giới thiệu đến khách hàng.",
        skills: [
            "Design",
            "Content"
        ]
    },

    digital: {
        category: "Bán hàng",
        title: "Hỗ trợ bán hàng trực tuyến",
        intro: "Cần hỗ trợ đưa sản phẩm lên các kênh trực tuyến và cải thiện cách tiếp cận khách hàng.",
        producer: "Hộ sản xuất địa phương",
        location: "Đà Nẵng",
        duration: "Khoảng 1 tuần",
        problem: "Hoạt động bán hàng chủ yếu dựa vào khách quen và các kênh truyền thống.",
        skills: [
            "Bán hàng",
            "Social Media",
            "Content"
        ]
    }

};


/* ================================================= */
/* GLOBAL */
/* ================================================= */

let currentProjectId = null;


/* ================================================= */
/* MODAL */
/* ================================================= */

function openModal(id) {

    const modal = document.getElementById(id);

    if (!modal) return;

    modal.classList.add("show");

    document.body.style.overflow = "hidden";
}


function closeModal() {

    document.querySelectorAll(".modal")
        .forEach(function(modal) {
            modal.classList.remove("show");
        });

    document.body.style.overflow = "";
}


/* Click outside modal */

document.querySelectorAll(".modal")
    .forEach(function(modal) {

        modal.addEventListener("click", function(event) {

            if (event.target === modal) {
                closeModal();
            }

        });

    });


/* ================================================= */
/* NEED FORM */
/* ================================================= */

function openNeedForm() {

    closeModal();

    setTimeout(function() {
        openModal("needModal");
    }, 100);

}


/* ================================================= */
/* CUSTOM DURATION */
/* ================================================= */

function toggleCustomDuration() {

    const duration =
        document.getElementById("duration");

    const customBox =
        document.getElementById("customDurationBox");

    if (!duration || !customBox) return;

    if (duration.value === "custom") {

        customBox.classList.add("show");

    } else {

        customBox.classList.remove("show");

    }

}


/* ================================================= */
/* SUBMIT NEED */
/* ================================================= */

async function submitNeed() {

    const product =
        document.getElementById("productName")
            .value
            .trim();

    const category =
        document.getElementById("category")
            .value;

    const description =
        document.getElementById("description")
            .value
            .trim();

    const durationSelect =
        document.getElementById("duration")
            .value;

    const customDuration =
        document.getElementById("customDuration")
            .value
            .trim();

    let duration = durationSelect;

    if (durationSelect === "custom") {
        duration = customDuration;
    }


    if (
        !product ||
        !category ||
        !description ||
        !duration
    ) {

        showToast(
            "Chưa đủ thông tin",
            "Hãy điền đầy đủ thông tin trước khi gửi."
        );

        return;
    }


    /* ========================= */
    /* LƯU NHU CẦU VÀO SUPABASE */
    /* ========================= */

    const { data, error } =
        await supabaseClient
            .from("needs")
            .insert([
                {
                    title: product,
                    category: category,
                    description: description,
                    duration: duration,
                    status: "Đang tìm"
                }
            ])
            .select()
            .single();


    if (error) {

        console.error(
            "SUBMIT NEED ERROR:",
            error
        );

        showToast(
            "Có lỗi xảy ra",
            "Chưa thể đăng nhu cầu. Thử lại nha."
        );

        return;
    }


    console.log(
        "NEED CREATED:",
        data
    );


    closeModal();

    showToast(
        "Đã đăng nhu cầu",
        "Nhu cầu đã được lưu trên AgriTalent Hub."
    );


    /* ========================= */
    /* XÓA FORM */
    /* ========================= */

    document.getElementById("productName").value = "";
    document.getElementById("category").value = "";
    document.getElementById("description").value = "";
    document.getElementById("duration").value = "";
    document.getElementById("customDuration").value = "";

    document
        .getElementById("customDurationBox")
        .classList.remove("show");


    /* ========================= */
    /* LOAD LẠI DANH SÁCH */
    /* ========================= */

    await renderUserNeeds();

}


/* ================================================= */
/* PROJECT */
/* ================================================= */

function openProject(id) {

    const project = projects[id];

    if (!project) return;


    currentProjectId = id;


    document.getElementById("projectCategory")
        .textContent =
        project.category.toUpperCase();


    document.getElementById("projectTitle")
        .textContent =
        project.title;


    document.getElementById("projectIntro")
        .textContent =
        project.intro;


    document.getElementById("projectProducer")
        .textContent =
        project.producer;


    document.getElementById("projectLocation")
        .textContent =
        project.location;


    document.getElementById("projectDuration")
        .textContent =
        project.duration;


    document.getElementById("projectProblem")
        .textContent =
        project.problem;


    const skillContainer =
        document.getElementById("projectSkills");


    skillContainer.innerHTML = "";


    project.skills.forEach(function(skill) {

        const span =
            document.createElement("span");

        span.textContent = skill;

        skillContainer.appendChild(span);

    });


    openModal("projectModal");

}


/* ================================================= */
/* USER NEED DETAIL */
/* ================================================= */

async function openUserNeed(id) {

    const { data: need, error } =
        await supabaseClient
            .from("needs")
            .select("*")
            .eq("id", Number(id))
            .single();


    if (error) {

        console.error(
            "LOAD NEED ERROR:",
            error
        );

        return;
    }


    if (!need) return;


    currentProjectId = need.id;


    document.getElementById("projectCategory")
        .textContent =
        (need.category || "").toUpperCase();


    document.getElementById("projectTitle")
        .textContent =
        need.title || "";


    document.getElementById("projectIntro")
        .textContent =
        need.description || "";


    document.getElementById("projectProducer")
        .textContent =
        "Đơn vị đăng nhu cầu";


    document.getElementById("projectLocation")
        .textContent =
        "Đà Nẵng";


    document.getElementById("projectDuration")
        .textContent =
        need.duration || "";


    document.getElementById("projectProblem")
        .textContent =
        need.description || "";


    document.getElementById("projectSkills")
        .innerHTML =
        `<span>${escapeHTML(
            need.category || ""
        )}</span>`;


    openModal("projectModal");

}


/* ================================================= */
/* GET / CREATE STUDENT USER */
/* ================================================= */

async function getOrCreateStudentUser(profile) {

    let { data: user, error: userError } =
        await supabaseClient
            .from("users")
            .select("*")
            .eq("name", profile.name)
            .maybeSingle();


    if (userError) {

        console.error(
            "LOAD USER ERROR:",
            userError
        );

        return null;
    }


    if (user) {
        return user;
    }


    const { data: newUser, error: createUserError } =
        await supabaseClient
            .from("users")
            .insert([
                {
                    name: profile.name,
                    role: "student"
                }
            ])
            .select()
            .single();


    if (createUserError) {

        console.error(
            "CREATE USER ERROR:",
            createUserError
        );

        return null;
    }


    return newUser;

}


/* ================================================= */
/* GET / CREATE SAMPLE NEED */
/* ================================================= */

async function getOrCreateSampleNeed(projectId) {

    const project = projects[projectId];

    if (!project) return null;


    /* ========================= */
    /* KIỂM TRA ĐÃ CÓ CHƯA */
    /* ========================= */

    const { data: existingNeed, error: findError } =
        await supabaseClient
            .from("needs")
            .select("*")
            .eq("title", project.title)
            .maybeSingle();


    if (findError) {

        console.error(
            "FIND SAMPLE NEED ERROR:",
            findError
        );

        return null;
    }


    if (existingNeed) {

        return existingNeed;
    }


    /* ========================= */
    /* TẠO PRODUCER */
    /* ========================= */

    let { data: producer, error: producerError } =
        await supabaseClient
            .from("users")
            .select("*")
            .eq("name", project.producer)
            .maybeSingle();


    if (producerError) {

        console.error(
            "LOAD PRODUCER ERROR:",
            producerError
        );

        return null;
    }


    if (!producer) {

        const { data: newProducer, error: createProducerError } =
            await supabaseClient
                .from("users")
                .insert([
                    {
                        name: project.producer,
                        role: "producer"
                    }
                ])
                .select()
                .single();


        if (createProducerError) {

            console.error(
                "CREATE PRODUCER ERROR:",
                createProducerError
            );

            return null;
        }


        producer = newProducer;
    }


    /* ========================= */
    /* TẠO NEED */
    /* ========================= */

    const { data: newNeed, error: createNeedError } =
        await supabaseClient
            .from("needs")
            .insert([
                {
                    title: project.title,
                    category: project.category,
                    description: project.intro,
                    duration: project.duration,
                    status: "Đang tìm",
                    producer_id: producer.id
                }
            ])
            .select()
            .single();


    if (createNeedError) {

        console.error(
            "CREATE SAMPLE NEED ERROR:",
            createNeedError
        );

        return null;
    }


    console.log(
        "SAMPLE NEED CREATED:",
        newNeed
    );


    return newNeed;

}


/* ================================================= */
/* JOIN PROJECT */
/* ================================================= */

async function joinProject() {

    console.log(
        "JOIN PROJECT ĐÃ CHẠY"
    );


    /* ========================= */
    /* KIỂM TRA HỒ SƠ */
    /* ========================= */

    const profile =
        JSON.parse(
            localStorage.getItem(
                "agriTalentStudent"
            )
        );


    if (!profile) {

        closeModal();


        setTimeout(function() {

            openStudentForm();


            showToast(
                "Tạo hồ sơ trước nhé",
                "Hồ sơ giúp AgriTalent Hub biết kỹ năng phù hợp của bạn."
            );


        }, 250);


        return;
    }


    if (!currentProjectId) {

        console.log(
            "KHÔNG CÓ PROJECT ID"
        );

        return;
    }


    /* ========================= */
    /* TÌM / TẠO STUDENT USER */
    /* ========================= */

    const user =
        await getOrCreateStudentUser(
            profile
        );


    if (!user) {

        showToast(
            "Có lỗi xảy ra",
            "Chưa thể xác định hồ sơ sinh viên."
        );

        return;
    }


    console.log(
        "USER ĐÃ XÁC ĐỊNH:",
        user
    );


    /* ========================= */
    /* XÁC ĐỊNH NEED */
    /* ========================= */

    let needId = null;


    const isSampleProject =
        ["spidana", "design", "digital"]
            .includes(
                String(currentProjectId)
            );


    /* ========================= */
    /* PROJECT MẪU */
    /* ========================= */

    if (isSampleProject) {

        const sampleNeed =
            await getOrCreateSampleNeed(
                String(currentProjectId)
            );


        if (!sampleNeed) {

            showToast(
                "Có lỗi xảy ra",
                "Chưa thể kết nối dự án này với hệ thống."
            );

            return;
        }


        needId =
            Number(sampleNeed.id);


        console.log(
            "SAMPLE NEED ID:",
            needId
        );

    } else {

        needId =
            Number(currentProjectId);


        console.log(
            "USER NEED ID:",
            needId
        );

    }


    if (!needId) {

        showToast(
            "Có lỗi xảy ra",
            "Không xác định được nhu cầu cần tham gia."
        );

        return;
    }


    /* ========================= */
    /* INSERT APPLICATION */
    /* ========================= */

    console.log(
        "CHUẨN BỊ INSERT APPLICATION"
    );


    const { error: applicationError } =
        await supabaseClient
            .from("applications")
            .insert([
                {
                    student_id: user.id,
                    need_id: needId,
                    message:
                        "Sinh viên muốn tham gia hỗ trợ nhu cầu này.",
                    status:
                        "Đang chờ duyệt"
                }
            ]);


    console.log(
        "APPLICATION INSERT ERROR:",
        applicationError
    );


    /* ========================= */
    /* XỬ LÝ LỖI */
    /* ========================= */

    if (applicationError) {

        console.error(
            "APPLICATION ERROR:",
            applicationError
        );


        showToast(
            "Có lỗi xảy ra",
            "Chưa thể gửi đăng ký tham gia."
        );


        return;
    }


    /* ========================= */
    /* LƯU HOẠT ĐỘNG LOCAL */
    /* ========================= */

    const joinedProjects =
        JSON.parse(
            localStorage.getItem(
                "agriTalentJoined"
            ) || "[]"
        );


    const joinedKey =
        String(currentProjectId);


    if (
        !joinedProjects.includes(
            joinedKey
        )
    ) {

        joinedProjects.push(
            joinedKey
        );


        localStorage.setItem(
            "agriTalentJoined",
            JSON.stringify(
                joinedProjects
            )
        );

    }


    /* ========================= */
    /* THÀNH CÔNG */
    /* ========================= */

    console.log(
        "APPLICATION CREATED"
    );


    closeModal();

    renderStudentProfile();


    showToast(
        "Đã gửi đăng ký",
        "AgriTalent Hub đã ghi nhận đăng ký của bạn."
    );

}


/* ================================================= */
/* STUDENT FORM */
/* ================================================= */

function openStudentForm() {

    closeModal();


    const savedProfile =
        JSON.parse(
            localStorage.getItem(
                "agriTalentStudent"
            )
        );


    if (savedProfile) {

        document.getElementById("studentName")
            .value =
            savedProfile.name || "";


        document.getElementById("studentCategory")
            .value =
            savedProfile.category || "";


        document.getElementById("studentBio")
            .value =
            savedProfile.bio || "";


        document
            .querySelectorAll(
                '#studentModal input[type="checkbox"]'
            )
            .forEach(function(checkbox) {

                checkbox.checked =
                    (savedProfile.skills || [])
                        .includes(
                            checkbox.value
                        );

            });


        if (savedProfile.otherSkill) {

            document
                .getElementById(
                    "otherSkillCheckbox"
                )
                .checked = true;


            document
                .getElementById(
                    "otherSkill"
                )
                .value =
                savedProfile.otherSkill;


            document
                .getElementById(
                    "otherSkillBox"
                )
                .classList.add("show");

        }

    }


    openModal("studentModal");

}


/* ================================================= */
/* OTHER SKILL */
/* ================================================= */

function toggleOtherSkill() {

    const checkbox =
        document.getElementById(
            "otherSkillCheckbox"
        );


    const box =
        document.getElementById(
            "otherSkillBox"
        );


    if (!checkbox || !box) return;


    if (checkbox.checked) {

        box.classList.add("show");

    } else {

        box.classList.remove("show");

        document.getElementById(
            "otherSkill"
        ).value = "";

    }

}


/* ================================================= */
/* SAVE STUDENT PROFILE */
/* ================================================= */

function saveStudentProfile() {

    const name =
        document.getElementById("studentName")
            .value
            .trim();


    const category =
        document.getElementById("studentCategory")
            .value;


    const bio =
        document.getElementById("studentBio")
            .value
            .trim();


    const skills = [];


    document
        .querySelectorAll(
            '#studentModal input[type="checkbox"]:checked'
        )
        .forEach(function(checkbox) {

            skills.push(
                checkbox.value
            );

        });


    const otherSkill =
        document.getElementById("otherSkill")
            .value
            .trim();


    if (
        !name ||
        skills.length === 0 ||
        !category
    ) {

        showToast(
            "Chưa đủ thông tin",
            "Hãy điền tên, lĩnh vực và ít nhất một kỹ năng."
        );

        return;
    }


    if (
        document
            .getElementById(
                "otherSkillCheckbox"
            )
            .checked &&
        !otherSkill
    ) {

        showToast(
            "Thiếu kỹ năng",
            "Hãy nhập kỹ năng khác của bạn."
        );

        return;

    }


    const profile = {

        name: name,

        skills: skills,

        category: category,

        bio: bio,

        otherSkill: otherSkill

    };


    localStorage.setItem(
        "agriTalentStudent",
        JSON.stringify(profile)
    );


    closeModal();

    renderStudentProfile();


    showToast(
        "Đã lưu hồ sơ",
        "Hồ sơ AgriTalent Hub của bạn đã được cập nhật."
    );


    setTimeout(function() {

        document
            .getElementById(
                "activity"
            )
            .scrollIntoView({
                behavior: "smooth"
            });

    }, 300);

}


/* ================================================= */
/* RENDER STUDENT */
/* ================================================= */

function renderStudentProfile() {

    const profilePreview =
        document.getElementById(
            "profilePreview"
        );


    const profile =
        JSON.parse(
            localStorage.getItem(
                "agriTalentStudent"
            )
        );


    if (!profilePreview) return;


    if (!profile) {

        profilePreview.innerHTML = `

            <div class="profile-placeholder">

                <span>○</span>

                <p>
                    Bạn chưa tạo hồ sơ sinh viên.
                </p>

                <button
                    class="secondary"
                    onclick="openStudentForm()">

                    Tạo hồ sơ

                </button>

            </div>

        `;

        return;

    }


    const joinedProjects =
        JSON.parse(
            localStorage.getItem(
                "agriTalentJoined"
            ) || "[]"
        );


    let joinedHTML = "";


    if (joinedProjects.length > 0) {

        joinedHTML = `
            <div class="joined-title">
                Hoạt động đã tham gia
            </div>
        `;


        joinedProjects.forEach(function(id) {

            let title = id;


            if (projects[id]) {

                title =
                    projects[id].title;

            }


            joinedHTML += `
                <div class="joined-project">
                    • ${escapeHTML(title)}
                </div>
            `;

        });

    }


    profilePreview.innerHTML = `

        <div class="profile-content">

            <h3>
                ${escapeHTML(profile.name)}
            </h3>

            <p>
                ${escapeHTML(profile.category)}
            </p>

            <div class="profile-skills">

                ${(profile.skills || [])
                    .map(function(skill) {

                        if (
                            skill === "Khác" &&
                            profile.otherSkill
                        ) {

                            return `
                                <span>
                                    ${escapeHTML(
                                        profile.otherSkill
                                    )}
                                </span>
                            `;

                        }


                        return `
                            <span>
                                ${escapeHTML(skill)}
                            </span>
                        `;

                    })
                    .join("")}

            </div>


            ${
                profile.bio
                    ? `<p>${escapeHTML(
                        profile.bio
                    )}</p>`
                    : ""
            }


            ${joinedHTML}


            <button
                class="secondary"
                onclick="openStudentForm()">

                Chỉnh sửa hồ sơ

            </button>

        </div>

    `;

}


/* ================================================= */
/* FILTER */
/* ================================================= */

function filterNeeds(category, button) {

    document
        .querySelectorAll(".filter")
        .forEach(function(btn) {

            btn.classList.remove("active");

        });


    if (button) {

        button.classList.add(
            "active"
        );

    }


    const cards =
        document.querySelectorAll(
            ".need-card"
        );


    let visibleCount = 0;


    cards.forEach(function(card) {

        const cardCategory =
            card.dataset.category;


        if (
            category === "all" ||
            cardCategory === category
        ) {

            card.style.display =
                "flex";

            visibleCount++;

        } else {

            card.style.display =
                "none";

        }

    });


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (emptyState) {

        emptyState.style.display =
            visibleCount === 0
                ? "block"
                : "none";

    }

}


/* ================================================= */
/* USER NEEDS */
/* ================================================= */

async function renderUserNeeds() {

    const grid =
        document.getElementById(
            "needGrid"
        );


    if (!grid) return;


    const { data, error } =
        await supabaseClient
            .from("needs")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "SUPABASE LOAD ERROR:",
            error
        );

        return;
    }


    grid
        .querySelectorAll(
            "[data-user-id]"
        )
        .forEach(function(card) {

            card.remove();

        });


    if (
        !data ||
        data.length === 0
    ) {

        return;

    }


    data.forEach(function(need) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "need-card";


        card.dataset.category =
            need.category || "";


        card.dataset.userId =
            need.id;


        card.innerHTML = `

            <div class="card-top">

                <span class="tag">

                    ${escapeHTML(
                        need.category || ""
                    ).toUpperCase()}

                </span>


                <span class="status">

                    ● ${escapeHTML(
                        need.status ||
                        "Đang tìm"
                    )}

                </span>

            </div>


            <h3>

                ${escapeHTML(
                    need.title || ""
                )}

            </h3>


            <p>

                ${escapeHTML(
                    need.description || ""
                )}

            </p>


            <div class="card-info">

                📍 Đà Nẵng

                <br>

                ⏱ ${escapeHTML(
                    need.duration || ""
                )}

            </div>


            <button
                onclick="openUserNeed('${need.id}')">

                Xem nhu cầu →

            </button>

        `;


        grid.appendChild(card);

    });

}


/* ================================================= */
/* TOAST */
/* ================================================= */

function showToast(
    title,
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    document.getElementById(
        "toastTitle"
    ).textContent =
        title;


    document.getElementById(
        "toastMessage"
    ).textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(function() {

        toast.classList.remove(
            "show"
        );

    }, 3500);

}


/* ================================================= */
/* HELPERS */
/* ================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ================================================= */
/* SCROLL */
/* ================================================= */

function scrollToNeeds() {

    document
        .getElementById(
            "needs"
        )
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* ================================================= */
/* INIT */
/* ================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        await renderUserNeeds();

        renderStudentProfile();

    }
);
