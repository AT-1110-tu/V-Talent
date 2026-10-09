/* =========================
   SUPABASE CONNECTION
========================= */

const SUPABASE_URL = "https://peonwgtejilfwceckbqo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_tHn2LFykKVEUtzY8Kukwvw_M_koy24p";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
/* =========================
   DEMO DATA
========================= */

const demoNeeds = [

    {
        id: 1,

        title:
            "Xây dựng nội dung truyền thông cho sản phẩm",

        category:
            "Truyền thông",

        description:
            "Hỗ trợ xây dựng nội dung giới thiệu sản phẩm, bài đăng mạng xã hội và cách truyền tải thông tin đến khách hàng.",

        duration:
            "2–3 tuần",

        business:
            "SpiDana"
    },


    {
        id: 2,

        title:
            "Hỗ trợ bán hàng trên nền tảng số",

        category:
            "Kinh doanh số hóa",

        description:
            "Hỗ trợ xây dựng nội dung bán hàng online, cải thiện cách giới thiệu sản phẩm và tiếp cận khách hàng trên không gian mạng.",

        duration:
            "3–4 tuần",

        business:
            "Hộ kinh doanh địa phương"
    },


    {
        id: 3,

        title:
            "Sắp xếp quy trình quản lý đơn hàng",

        category:
            "Vận hành",

        description:
            "Hỗ trợ xây dựng cách theo dõi đơn hàng, quản lý thông tin khách hàng và đơn giản hóa một số công việc vận hành.",

        duration:
            "2 tuần",

        business:
            "Cơ sở sản xuất nhỏ"
    }

];


/* =========================
   ELEMENT
========================= */

const needsList =
    document.getElementById("needsList");


/* =========================
   RENDER NEEDS
========================= */

function renderNeeds(category = "all") {

    if (!needsList) return;


    const filtered =
        category === "all"

            ? demoNeeds

            : demoNeeds.filter(
                item => item.category === category
            );


    needsList.innerHTML = "";


    if (filtered.length === 0) {

        needsList.innerHTML = `
            <div class="empty-state">
                Hiện chưa có nhu cầu phù hợp.
            </div>
        `;

        return;
    }


    filtered.forEach(need => {

        const card =
            document.createElement("div");


        card.className =
            "need-card";


        card.innerHTML = `

            <span class="need-category">
                ${need.category}
            </span>

            <h3>
                ${need.title}
            </h3>

            <p>
                ${need.description}
            </p>

            <div class="need-footer">

                <span class="need-duration">
                    ${need.duration}
                </span>

                <button
                    class="need-view"
                    onclick="openNeedModal(${need.id})"
                >
                    Xem chi tiết →
                </button>

            </div>
        `;


        needsList.appendChild(card);

    });

}


/* =========================
   FILTER
========================= */

function filterNeeds(category, button) {

    document
        .querySelectorAll(".filter-btn")
        .forEach(btn =>
            btn.classList.remove("active")
        );


    button.classList.add("active");


    renderNeeds(category);
}


/* =========================
   MODAL
========================= */

function openModal(id) {

    document
        .getElementById(id)
        .classList.add("show");


    document.body.style.overflow =
        "hidden";
}


function closeModal(id) {

    document
        .getElementById(id)
        .classList.remove("show");


    if (
        !document.querySelector(".modal.show")
    ) {

        document.body.style.overflow =
            "";
    }
}


/* =========================
   OPEN BUSINESS
========================= */

function openBusinessModal() {

    openModal("businessModal");
}


/* =========================
   OPEN STUDENT
========================= */

function openStudentModal() {

    loadStudentProfile();

    openModal("studentModal");
}


/* =========================
   NEED DETAIL
========================= */

function openNeedModal(id) {

    const need =
        demoNeeds.find(
            item => item.id === id
        );


    if (!need) return;


    document.getElementById(
        "needCategory"
    ).textContent =
        need.category;


    document.getElementById(
        "needTitle"
    ).textContent =
        need.title;


    document.getElementById(
        "needDescription"
    ).textContent =
        need.description;


    document.getElementById(
        "needDuration"
    ).textContent =
        need.duration;


    document.getElementById(
        "applyButton"
    ).onclick = function () {

        closeModal("needModal");

        openApplicationModal(
            need.id
        );
    };


    openModal("needModal");
}


/* =========================
   APPLICATION
========================= */

function openApplicationModal(needId) {

    document.getElementById(
        "applicationNeedId"
    ).value =
        needId;


    openModal(
        "applicationModal"
    );
}


document
    .getElementById("applicationForm")
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const student =
                JSON.parse(
                    localStorage.getItem(
                        "vtalentStudent"
                    )
                );


            if (!student) {

                closeModal(
                    "applicationModal"
                );


                showToast(
                    "Bạn hãy tạo hồ sơ sinh viên trước."
                );


                setTimeout(
                    () => openStudentModal(),
                    400
                );


                return;
            }


            const application = {

                id: Date.now(),

                needId:
                    Number(
                        document.getElementById(
                            "applicationNeedId"
                        ).value
                    ),

                studentId:
                    student.email,

                support:
                    document.getElementById(
                        "applicationSupport"
                    ).value,

                fit:
                    document.getElementById(
                        "applicationFit"
                    ).value,

                result:
                    document.getElementById(
                        "applicationResult"
                    ).value,

                status:
                    "pending",

                createdAt:
                    new Date().toISOString()
            };


            const applications =
                JSON.parse(
                    localStorage.getItem(
                        "vtalentApplications"
                    )
                ) || [];


            applications.push(
                application
            );


            localStorage.setItem(
                "vtalentApplications",
                JSON.stringify(
                    applications
                )
            );


            this.reset();


            closeModal(
                "applicationModal"
            );


            showToast(
                "Đã gửi đề xuất hỗ trợ."
            );

        }
    );


/* =========================
   STUDENT PROFILE
========================= */

document
    .getElementById("studentForm")
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const competencies =
                getCheckedValues(
                    "competency"
                );


            const skills =
                getCheckedValues(
                    "skill"
                );


            const competencyOther =
                document
                    .getElementById(
                        "competencyOther"
                    )
                    .value
                    .trim();


            const skillOther =
                document
                    .getElementById(
                        "skillOther"
                    )
                    .value
                    .trim();


            if (
                document.querySelector(
                    'input[name="competency"][value="Khác"]'
                ).checked &&
                competencyOther
            ) {

                competencies.push(
                    competencyOther
                );
            }


            if (
                document.querySelector(
                    'input[name="skill"][value="Khác"]'
                ).checked &&
                skillOther
            ) {

                skills.push(
                    skillOther
                );
            }


            const profile = {

                name:
                    document
                        .getElementById(
                            "studentName"
                        )
                        .value
                        .trim(),

                school:
                    document
                        .getElementById(
                            "studentSchool"
                        )
                        .value
                        .trim(),

                phone:
                    document
                        .getElementById(
                            "studentPhone"
                        )
                        .value
                        .trim(),

                email:
                    document
                        .getElementById(
                            "studentEmail"
                        )
                        .value
                        .trim(),

                intro:
                    document
                        .getElementById(
                            "studentIntro"
                        )
                        .value
                        .trim(),

                competencies,

                skills,

                createdAt:
                    new Date().toISOString()
            };


            localStorage.setItem(
                "vtalentStudent",
                JSON.stringify(profile)
            );


            closeModal(
                "studentModal"
            );


            showToast(
                "Đã lưu hồ sơ sinh viên."
            );

        }
    );


/* =========================
   LOAD STUDENT
========================= */

function loadStudentProfile() {

    const profile =
        JSON.parse(
            localStorage.getItem(
                "vtalentStudent"
            )
        );


    if (!profile) return;


    document.getElementById(
        "studentName"
    ).value =
        profile.name || "";


    document.getElementById(
        "studentSchool"
    ).value =
        profile.school || "";


    document.getElementById(
        "studentPhone"
    ).value =
        profile.phone || "";


    document.getElementById(
        "studentEmail"
    ).value =
        profile.email || "";


    document.getElementById(
        "studentIntro"
    ).value =
        profile.intro || "";


    resetCheckboxes(
        "competency"
    );


    resetCheckboxes(
        "skill"
    );


    (profile.competencies || [])
        .forEach(value => {

            const checkbox =
                document.querySelector(
                    `input[name="competency"][value="${CSS.escape(value)}"]`
                );


            if (checkbox) {
                checkbox.checked =
                    true;
            }

        });


    (profile.skills || [])
        .forEach(value => {

            const checkbox =
                document.querySelector(
                    `input[name="skill"][value="${CSS.escape(value)}"]`
                );


            if (checkbox) {
                checkbox.checked =
                    true;
            }

        });

}


/* =========================
   BUSINESS FORM
========================= */

document
    .getElementById("businessForm")
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const categories =
                getCheckedValues(
                    "businessNeed"
                );


            const other =
                document
                    .getElementById(
                        "businessNeedOther"
                    )
                    .value
                    .trim();


            if (
                document.querySelector(
                    'input[name="businessNeed"][value="Khác"]'
                ).checked &&
                other
            ) {

                categories.push(
                    other
                );
            }


            const need = {

                id: Date.now(),

                business:
                    document
                        .getElementById(
                            "businessName"
                        )
                        .value
                        .trim(),

                phone:
                    document
                        .getElementById(
                            "businessPhone"
                        )
                        .value
                        .trim(),

                address:
                    document
                        .getElementById(
                            "businessAddress"
                        )
                        .value
                        .trim(),

                field:
                    document
                        .getElementById(
                            "businessField"
                        )
                        .value
                        .trim(),

                product:
                    document
                        .getElementById(
                            "businessProduct"
                        )
                        .value
                        .trim(),

                categories,

                description:
                    document
                        .getElementById(
                            "businessDescription"
                        )
                        .value
                        .trim(),

                people:
                    document
                        .getElementById(
                            "businessPeople"
                        )
                        .value,

                duration:
                    document
                        .getElementById(
                            "businessDuration"
                        )
                        .value
                        .trim(),

                status:
                    "open",

                createdAt:
                    new Date().toISOString()
            };


            const savedNeeds =
                JSON.parse(
                    localStorage.getItem(
                        "vtalentBusinessNeeds"
                    )
                ) || [];


            savedNeeds.push(
                need
            );


            localStorage.setItem(
                "vtalentBusinessNeeds",
                JSON.stringify(
                    savedNeeds
                )
            );


            this.reset();


            document
                .getElementById(
                    "businessNeedOther"
                )
                .classList.add(
                    "hidden"
                );


            closeModal(
                "businessModal"
            );


            showToast(
                "Đã đăng nhu cầu hỗ trợ."
            );

        }
    );


/* =========================
   CHECKBOX HELPERS
========================= */

function getCheckedValues(name) {

    return Array.from(
        document.querySelectorAll(
            `input[name="${name}"]:checked`
        )
    )
        .map(
            input => input.value
        )
        .filter(
            value => value !== "Khác"
        );
}


function resetCheckboxes(name) {

    document
        .querySelectorAll(
            `input[name="${name}"]`
        )
        .forEach(
            input => {
                input.checked =
                    false;
            }
        );
}


function toggleOther(
    inputId,
    checkbox
) {

    const input =
        document.getElementById(
            inputId
        );


    if (!input) return;


    input.classList.toggle(
        "hidden",
        !checkbox.checked
    );


    if (!checkbox.checked) {

        input.value = "";

    }
}


/* =========================
   TOAST
========================= */

let toastTimeout;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimeout
    );


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );
}


/* =========================
   CLOSE MODAL OUTSIDE
========================= */

document
    .querySelectorAll(".modal")
    .forEach(modal => {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    closeModal(
                        modal.id
                    );

                }

            }
        );

    });


/* =========================
   ESC
========================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !== "Escape"
        ) {
            return;
        }


        const opened =
            document.querySelector(
                ".modal.show"
            );


        if (opened) {

            closeModal(
                opened.id
            );

        }

    }
);


/* =========================
   INIT
========================= */

renderNeeds();
