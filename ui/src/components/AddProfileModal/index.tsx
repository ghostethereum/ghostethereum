import React, {ReactElement, useCallback, useState} from "react";
import Modal, {ModalContent, ModalFooter, ModalHeader} from "../Modal";
import "./add-profile-modal.scss";
import Icon from "../Icon";
import SpinnerGif from "../../../static/icons/spinner.gif";
import GhostLogo from "../../../static/icons/ghost-logo-dark.png";
import Input from "../Input";
import Button from "../Button";
import Dropdown from "../Dropdown";
import {createPaymentProfile, fetchPaymentProfiles, PaymentPlan, PaymentProfilePayload} from "../../ducks/profiles";
import {useDispatch} from "react-redux";

type Props = {
    onClose: () => void;
}

enum Steps {
    ChooseIntegration,
    IntegrationForm,
    PaymentPlans,
}

export default function AddProfileModal(props: Props): ReactElement {
    const [currentStep, setStep] = useState(Steps.ChooseIntegration);
    const [adminUrl, setAdminUrl] = useState('');
    const [adminAPIKey, setAdminAPIKey] = useState('');
    const [plans, setPlans] = useState<PaymentPlan[]>([]);
    const dispatch = useDispatch();

    const onSubmit = useCallback(async () => {
        await dispatch(createPaymentProfile({
            adminUrl,
            adminAPIKey,
            plans,
        }));
        props.onClose();
        dispatch(fetchPaymentProfiles());
    }, [
        plans,
        adminUrl,
        adminAPIKey,
    ]);

    switch (currentStep) {
        case Steps.ChooseIntegration:
            return (
                <ChooseIntegration
                    {...props}
                    onNext={() => setStep(Steps.IntegrationForm)}
                />
            );
        case Steps.IntegrationForm:
            return (
                <IntegrationForm
                    {...props}
                    onNext={() => setStep(Steps.PaymentPlans)}
                    onBack={() => setStep(Steps.ChooseIntegration)}
                    adminUrl={adminUrl}
                    adminAPIKey={adminAPIKey}
                    updateAdminUrl={(url: string) => setAdminUrl(url)}
                    updateAdminAPIKey={(key: string) => setAdminAPIKey(key)}
                />
            );
        case Steps.PaymentPlans:
            return (
                <PaymentPlans
                    {...props}
                    adminUrl={adminUrl}
                    onBack={() => setStep(Steps.IntegrationForm)}
                    onNext={() => null}
                    onSubmit={onSubmit}
                    plans={plans}
                    setPlans={setPlans}
                />
            )
        default:
            return (
                <ChooseIntegration
                    {...props}
                    onNext={() => setStep(Steps.IntegrationForm)}
                />
            );
    }
}

type StepProps = {
    onClose: () => void;
    onNext: () => void;
    onBack?: () => void;
}

function ChooseIntegration(props: StepProps) {
    return (
        <Modal
            className="add-profile-modal"
            onClose={props.onClose}
        >
            <ModalHeader onClose={props.onClose}>
                Choose integrations
            </ModalHeader>
            <ModalContent>
                <div
                    className="add-profile-modal__content-row"
                    onClick={props.onNext}
                >
                    <div className="add-profile-modal__content-row__name">
                        Ghost
                    </div>
                    <div className="add-profile-modal__content-row__icon">
                        <Icon
                            size={2}
                            url={GhostLogo}
                        />
                    </div>
                </div>
            </ModalContent>
        </Modal>
    );
}



function IntegrationForm(props: StepProps & {
    updateAdminUrl: (data: string) => void;
    updateAdminAPIKey: (data: string) => void;
    adminUrl: string;
    adminAPIKey: string;

}) {
    return (
        <Modal
            className="add-profile-modal"
            onClose={props.onClose}
        >
            <ModalHeader onClose={props.onClose}>
                Enter Ghost Admin Info
            </ModalHeader>
            <ModalContent>
                <p>
                    <small>
                        Feel lost? <a href="https://ghost.org/docs/admin-api/#token-authentication" target="_blank">See instruction here</a>
                    </small>
                </p>
                <Input
                    label="Base URL"
                    type="text"
                    placeholder="https://demo.ghost.io"
                    value={props.adminUrl}
                    onChange={e => props.updateAdminUrl(e.target.value)}
                />
                <Input
                    label="Admin API Key"
                    type="text"
                    value={props.adminAPIKey}
                    onChange={e => props.updateAdminAPIKey(e.target.value)}
                />
            </ModalContent>
            <ModalFooter>
                <Button
                    btnType="secondary"
                    onClick={props.onBack}
                >
                    Back
                </Button>
                <Button
                    btnType="primary"
                    onClick={props.onNext}
                    disabled={!props.adminAPIKey || !props.adminUrl}
                >
                    Next
                </Button>
            </ModalFooter>
        </Modal>
    );
}

const paymentPlanValueToText: {
    [k: string]: string;
} = {
    monthly: 'Monthly',
    yearly: 'Yearly',
};

const paymentPlansOptions = [
    { value: 'monthly', text: 'Monthly'},
    { value: 'yearly', text: 'Yearly'},
];

function AddPaymentPlan(props: StepProps & {
    plans: PaymentPlan[];
    setPlans: (plans: PaymentPlan[]) => void;
    onBackToPlans: () => void;
}): ReactElement {
    const {plans} = props;
    const existingOptions = plans.reduce((map: any, plan) => {
        map[plan.title] = true;
        return map;
    }, {});
    const paymentOptions = paymentPlansOptions.filter(({value}) => !existingOptions[value]);
    const [draftCurrency, setDraftCurrency] = useState<string>('DAI');
    const [draftDescription, setDraftDescription] = useState<string>('');
    const [draftAmount, setDraftAmount] = useState<number>();
    const [draftTerm, setDraftTerm] = useState<'monthly'|'yearly'>(paymentOptions[0].value as any);

    const updateCurrency = useCallback((e) => {
        setDraftCurrency(e.target.value);
    }, []);

    const updateTerm = useCallback((e) => {
        setDraftTerm(e.target.value);
    }, []);

    const updateDescription = useCallback((e) => {
        setDraftDescription(e.target.value);
    }, []);

    const updateAmount = useCallback((e) => {
        setDraftAmount(e.target.value);
    }, []);

    const disabled = !draftCurrency || !draftAmount || !draftTerm;

    const onNext = useCallback(() => {
        if (existingOptions[draftTerm]) {
            return;
        }

        const newPlan: PaymentPlan = {
          title: draftTerm,
          description: draftDescription,
          currency: draftCurrency,
          amount: draftAmount || 0,
        };

        props.setPlans([...plans, newPlan]);
        props.onBackToPlans();
    }, [
        plans,
        draftTerm,
        draftAmount,
        draftDescription,
        draftCurrency,
    ]);

    return (
        <Modal
            className="add-profile-modal"
            onClose={props.onClose}
        >
            <ModalHeader onClose={props.onClose}>
                Edit Payment Plans
            </ModalHeader>
            <ModalContent>
                <Dropdown
                    label="Currency"
                    options={[
                        { value: 'DAI', text: 'DAI' },
                    ]}
                    onChange={updateCurrency}
                    value={draftCurrency}
                />
                <Dropdown
                    label="Payment Terms"
                    options={paymentOptions}
                    value={draftTerm}
                    onChange={updateTerm}
                />
                <Input
                    className="plan-description-input"
                    label="Plan Description"
                    type="text"
                    placeholder="e.g. month-to-month flexibility"
                    onChange={updateDescription}
                    value={draftDescription}
                />
                <Input
                    label="Amount"
                    type="number"
                    onChange={updateAmount}
                    value={draftAmount}
                />
            </ModalContent>
            <ModalFooter>
                <Button
                    btnType="secondary"
                    onClick={plans.length ? props.onBackToPlans : props.onBack}
                >
                    Back
                </Button>
                <Button
                    btnType="primary"
                    onClick={onNext}
                    disabled={disabled}
                >
                    Add Plan
                </Button>
            </ModalFooter>
        </Modal>
    );
}

function PaymentPlans(props: StepProps & {
    adminUrl: string;
    plans: PaymentPlan[];
    setPlans: (plans: PaymentPlan[]) => void;
    onSubmit: () => Promise<any>;
}): ReactElement {
    const [isAdding, setIsAdding] = useState(false);
    const [sending, setSending] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const removePlan = useCallback((index: number) => {
        const newPlans = props.plans.filter((_, i) => i !== index);
        props.setPlans(newPlans);
    }, [props.plans]);

    const onSubmit = useCallback(async () => {
        setSending(true);
        try {
            await props.onSubmit();
        } catch (e) {
            setErrorMessage(e.message);
        }
        setSending(false);
    }, [props.onSubmit])

    if (!props.plans.length || isAdding) {
        return (
            <AddPaymentPlan
                {...props}
                onBackToPlans={() => setIsAdding(false)}
            />
        );
    }

    return (
        <Modal
            className="add-profile-modal"
            onClose={props.onClose}
        >
            <ModalHeader onClose={props.onClose}>
                Payment Profile
            </ModalHeader>
            <ModalContent>
                <p>You are ready to create your payment profile!</p>
                <Input
                    label="Admin URL"
                    value={props.adminUrl}
                    disabled
                />
                <div className="add-profile-modal__review-plans-label">
                    Payment Plans
                    {
                        props.plans.length < 2 && (
                            <div className="add-profile-modal__review-plans-label__action">
                                <a onClick={() => setIsAdding(true)}>
                                    Add new plan
                                </a>
                            </div>
                        )
                    }
                </div>
                {
                    props.plans.map((plan, i) => (
                        <div className="plan-row">
                            <div className="plan-row__l">
                                <div className="plan-row__title">
                                    {paymentPlanValueToText[plan.title]}
                                </div>
                                <div className="plan-row__description">
                                    {plan.description}
                                </div>
                            </div>
                            <div className="plan-row__r">
                                {`${plan.amount} ${plan.currency}`}
                            </div>
                            <div className="plan-row__remove">
                                <Icon
                                    size={1}
                                    onClick={() => removePlan(i)}
                                    fa="far fa-trash-alt"
                                />
                            </div>
                        </div>
                    ))
                }
                <small className="error-message">{errorMessage}</small>
            </ModalContent>
            <ModalFooter>
                <Button
                    btnType="secondary"
                    onClick={props.onBack}
                >
                    Back
                </Button>
                <Button
                    btnType="primary"
                    onClick={onSubmit}
                    loading={sending}
                >
                    Submit
                </Button>
            </ModalFooter>
        </Modal>
    );
}