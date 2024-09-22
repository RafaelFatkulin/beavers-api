export const createSuccessResponse = <T>({
    message,
    data
}: {
    message?: string | null,
    data?: T
}) => {
    return {
        success: true,
        message: message ?? null,
        data
    }
}

export const createErrorResponse = ({
    message,
}: {
    message?: string | Record<string, string>
}) => {
    return {
        success: false,
        message,
        data: null
    }
}