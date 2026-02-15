import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SurveyForm from "@/Components/SurveyForm";

export default function Edit({ auth, survey }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Edit Data
                </h2>
            }
        >
            <SurveyForm survey={survey} />
        </AuthenticatedLayout>
    );
}
